/* RBAC end-to-end role matrix.
 *
 * Boots the real app (all modules, global guard + audit interceptor) against
 * a THROWAWAY Postgres database and checks, over HTTP, that every staff
 * route lets in exactly the staff it should:
 *
 *   1. generic matrix   - every staff route x permission combinations, using a
 *                         probe role whose permissions are rewritten per check
 *   2. built-in roles   - Owner / Manager / Order Staff / Content Editor with
 *                         their default permissions x every staff route, plus
 *                         a hand-written table of business expectations
 *   3. management rules - staff/role API rules, sessions, audit log
 *
 * Safety: requests that should be REFUSED are sent over HTTP (the guard stops
 * them before any handler runs). Requests that should be ALLOWED are sent over
 * HTTP only for GET routes; for writes the same AccessPolicyGuard is asked
 * in-process instead, so the run never sends emails, books couriers or calls
 * other external services.
 *
 * Database: uses <DB_NAME from .env>_rbac_e2e (or RBAC_E2E_DB_NAME), creates it
 * if missing and WIPES its schema at the start of every run. It refuses to
 * run against any database whose name doesn't end in _e2e / _test, or a
 * non-local host unless RBAC_E2E_ALLOW_REMOTE=1.
 *
 *   npm run test:rbac
 */
import 'reflect-metadata';
import { join } from 'path';
import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Client } from 'pg';
import * as request from 'supertest';

import {
  ALL_PERMISSIONS,
  BUILT_IN_ROLES,
  OWNER_ONLY_PERMISSIONS,
  OWNER_ROLE_KEY,
  P,
  Permission,
} from 'src/Rbac/permissions';
import { allRoutes, isStaffRoute, RouteInfo } from 'src/Rbac/route-inventory';
import type { AccessPolicyGuard as GuardType } from 'src/Rbac/access-policy.guard';

jest.setTimeout(15 * 60 * 1000);

/* ------------------------------------------------------------------ */
/* Database selection + safety                                         */
/* ------------------------------------------------------------------ */

const envFile = dotenv.config({ path: join(__dirname, '..', '.env') }).parsed || {};
const DB_HOST = process.env.DB_HOST || envFile.DB_HOST;
const DB_PORT = Number(process.env.DB_PORT || envFile.DB_PORT || 5432);
const DB_USERNAME = process.env.DB_USERNAME || envFile.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD || envFile.DB_PASSWORD;
const BASE_DB = envFile.DB_NAME || process.env.DB_NAME || 'tahams';
const TEST_DB = process.env.RBAC_E2E_DB_NAME || `${BASE_DB}_rbac_e2e`;

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1'];
if (!/(_e2e|_test)$/i.test(TEST_DB)) {
  throw new Error(`Refusing to run: test database "${TEST_DB}" must end in _e2e or _test`);
}
if (TEST_DB === BASE_DB) {
  throw new Error('Refusing to run: test database equals the app database');
}
if (!LOCAL_HOSTS.includes(String(DB_HOST)) && process.env.RBAC_E2E_ALLOW_REMOTE !== '1') {
  throw new Error(`Refusing to run against non-local DB host "${DB_HOST}" (set RBAC_E2E_ALLOW_REMOTE=1)`);
}
// Must be set BEFORE AppModule is imported: ConfigModule never overrides an
// existing process.env value with the .env file's.
process.env.DB_NAME = TEST_DB;

const pgConfig = (database: string) => ({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database,
});

async function resetTestDatabase() {
  const admin = new Client(pgConfig(BASE_DB));
  await admin.connect();
  const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [TEST_DB]);
  if (!exists.rowCount) {
    await admin.query(`CREATE DATABASE "${TEST_DB.replace(/"/g, '')}"`);
  }
  await admin.end();

  const db = new Client(pgConfig(TEST_DB));
  await db.connect();
  await db.query('DROP SCHEMA public CASCADE');
  await db.query('CREATE SCHEMA public');
  await db.end();
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const GRANTABLE: Permission[] = ALL_PERMISSIONS.filter(
  (p) => !(OWNER_ONLY_PERMISSIONS as readonly string[]).includes(p),
);
const PASSWORD = 'E2e-Staff-Pass-2026';
const GUARD_DENIAL = /^(Missing permission|Requires one of|Staff access required|Access denied)/;

let app: INestApplication;
let ds: DataSource;
let guard: GuardType;
let http: any;

type Res = { status: number; body: any };

const call = async (method: string, path: string, token?: string, body?: any): Promise<Res> => {
  let r = request(http)[method.toLowerCase()](`/api${path}`);
  if (token) r = r.set('Authorization', `Bearer ${token}`);
  if (body !== undefined) r = r.send(body);
  const res = await r;
  return { status: res.status, body: res.body };
};

const isGuardDenied = (res: Res) =>
  res.status === 403 && GUARD_DENIAL.test(String(res.body?.message || ''));
const passedGuard = (res: Res) => res.status !== 401 && !isGuardDenied(res);

// concrete URL for a route: params -> an id that doesn't exist, GETs carry
// the caller's email (some list routes require it)
const urlFor = (r: RouteInfo, email?: string) => {
  const path = r.path.replace(/:[A-Za-z_]+/g, '999999');
  return r.method === 'GET' && email ? `${path}?email=${encodeURIComponent(email)}` : path;
};

const signin = async (email: string, password: string) => {
  const res = await call('POST', '/admin/signin', undefined, { email, password });
  const token = res.body?.access_token;
  if (!token) throw new Error(`signin failed for ${email}: ${JSON.stringify(res.body)}`);
  return token as string;
};

// Ask the real guard (same class, same services) whether a request with this
// token would get past it - used for allowed WRITE checks so no handler runs.
const guardAllows = async (r: RouteInfo, token: string) => {
  const req: any = {
    method: r.method,
    headers: { authorization: `Bearer ${token}` },
    params: {},
    body: {},
    route: { path: `/api${r.path}` },
    originalUrl: `/api${r.path}`,
  };
  const ctx: any = {
    getType: () => 'http',
    getHandler: () => r.handler,
    getClass: () => r.controller,
    switchToHttp: () => ({ getRequest: () => req, getResponse: () => ({}) }),
  };
  try {
    return (await guard.canActivate(ctx)) === true;
  } catch {
    return false;
  }
};

const satisfies = (route: RouteInfo, perms: Set<string>, isOwner = false) => {
  if (isOwner) return true;
  if (route.policy === 'staff') return true;
  const listed = route.permissions || [];
  return route.policy === 'permissions'
    ? listed.every((p) => perms.has(p))
    : listed.some((p) => perms.has(p));
};

// One allowed/denied expectation, checked the safe way (see header).
const expectAccess = async (
  r: RouteInfo,
  who: { token: string; email: string },
  allowed: boolean,
  failures: string[],
  label: string,
) => {
  if (allowed) {
    if (r.method === 'GET') {
      const res = await call('GET', urlFor(r, who.email), who.token);
      if (!passedGuard(res)) failures.push(`${label}: expected allowed, got ${res.status} ${res.body?.message}`);
    } else if (!(await guardAllows(r, who.token))) {
      failures.push(`${label}: expected allowed, guard refused`);
    }
  } else {
    const res = await call(r.method, urlFor(r, who.email), who.token, r.method === 'GET' ? undefined : {});
    if (!isGuardDenied(res)) failures.push(`${label}: expected 403, got ${res.status} ${res.body?.message}`);
  }
};

/* ------------------------------------------------------------------ */
/* Fixtures                                                            */
/* ------------------------------------------------------------------ */

const ROUTES = allRoutes();
const STAFF_ROUTES = ROUTES.filter(isStaffRoute);
const route = (key: string) => {
  const r = ROUTES.find((x) => x.key === key);
  if (!r) throw new Error(`route not found: ${key}`);
  return r;
};

let roleIds: Record<string, number> = {};
let owner: { token: string; email: string; id: number };
let customer: { token: string; email: string; id: number };

async function insertUser(email: string, opts: { role?: string; staffRoleId?: number | null } = {}) {
  const hash = await bcrypt.hash(PASSWORD, await bcrypt.genSalt());
  const rows = await ds.query(
    `INSERT INTO users (name, email, password, role, "uniqueId", "staffRoleId", "staffActive")
     VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id`,
    [email.split('@')[0], email, hash, opts.role || 'customer', `e2e-${email}`, opts.staffRoleId ?? null],
  );
  return rows[0].id as number;
}

async function createStaff(email: string, roleId: number) {
  const res = await call('POST', '/admin/staff', owner.token, {
    name: email.split('@')[0],
    email,
    password: PASSWORD,
    roleId,
  });
  if (res.status !== 201) throw new Error(`create staff ${email}: ${res.status} ${JSON.stringify(res.body)}`);
  return { id: res.body.id as number, email, token: await signin(email, PASSWORD) };
}

const setRolePermissions = async (roleId: number, permissions: string[]) => {
  const res = await call('PATCH', `/admin/roles/${roleId}`, owner.token, { permissions });
  if (res.status !== 200) throw new Error(`set role perms: ${res.status} ${JSON.stringify(res.body)}`);
};

/* ------------------------------------------------------------------ */

beforeAll(async () => {
  await resetTestDatabase();

  // imported here, after process.env.DB_NAME points at the test database
  const { AppModule } = await import('src/app.module');
  const { AccessPolicyGuard } = await import('src/Rbac/access-policy.guard');
  const { RbacService } = await import('src/Rbac/rbac.service');
  const { AuditService } = await import('src/Rbac/audit.service');

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication({ logger: ['error'] });
  app.setGlobalPrefix('api'); // as in main.ts
  await app.init();
  http = app.getHttpServer();

  ds = app.get(DataSource);
  const [{ current_database }] = await ds.query('SELECT current_database()');
  if (current_database !== TEST_DB) {
    throw new Error(`Connected to "${current_database}", expected "${TEST_DB}" - aborting`);
  }

  guard = new AccessPolicyGuard(
    app.get(Reflector),
    app.get(JwtService, { strict: false }),
    app.get(RbacService, { strict: false }),
    app.get(AuditService, { strict: false }),
  );

  const roles = await ds.query('SELECT id, key FROM roles WHERE key IS NOT NULL');
  roleIds = Object.fromEntries(roles.map((r) => [r.key, r.id]));

  const ownerEmail = 'e2e-owner@test.local';
  const ownerId = await insertUser(ownerEmail, { role: 'admin', staffRoleId: roleIds[OWNER_ROLE_KEY] });
  owner = { id: ownerId, email: ownerEmail, token: await signin(ownerEmail, PASSWORD) };

  const customerEmail = 'e2e-customer@test.local';
  const customerId = await insertUser(customerEmail);
  customer = { id: customerId, email: customerEmail, token: await signin(customerEmail, PASSWORD) };
});

afterAll(async () => {
  await app?.close();
});

/* ------------------------------------------------------------------ */

describe('setup', () => {
  it('found the staff routes', () => {
    expect(STAFF_ROUTES.length).toBeGreaterThan(60);
  });

  it('created the built-in roles with their default permissions', async () => {
    const res = await call('GET', '/admin/roles', owner.token);
    expect(res.status).toBe(200);
    for (const def of BUILT_IN_ROLES) {
      const role = res.body.find((r) => r.key === def.key);
      expect(role).toBeDefined();
      if (def.key === OWNER_ROLE_KEY) {
        expect([...role.permissions].sort()).toEqual([...ALL_PERMISSIONS].sort());
      } else {
        expect([...role.permissions].sort()).toEqual([...def.defaultPermissions].sort());
      }
    }
  });

  it('/admin/me reports access the way the admin UI expects', async () => {
    const me = await call('GET', '/admin/me', owner.token);
    expect(me.status).toBe(200);
    expect(me.body).toMatchObject({ id: owner.id, isStaff: true, isOwner: true, role: { key: OWNER_ROLE_KEY } });
    expect(me.body.permissions).toEqual(expect.arrayContaining([...ALL_PERMISSIONS]));

    const c = await call('GET', '/admin/me', customer.token);
    expect(c.status).toBe(200);
    expect(c.body).toMatchObject({ isStaff: false, isOwner: false, role: null, permissions: [] });

    expect((await call('GET', '/admin/me')).status).toBe(401);
  });
});

describe('every staff route', () => {
  it('refuses requests without a token (401)', async () => {
    const failures = [];
    for (const r of STAFF_ROUTES) {
      const res = await call(r.method, urlFor(r), undefined, r.method === 'GET' ? undefined : {});
      if (res.status !== 401) failures.push(`${r.id}: ${res.status}`);
    }
    expect(failures).toEqual([]);
  });

  it('refuses a customer token (403 Staff access required)', async () => {
    const failures = [];
    for (const r of STAFF_ROUTES) {
      const res = await call(r.method, urlFor(r, customer.email), customer.token, r.method === 'GET' ? undefined : {});
      if (!(res.status === 403 && /Staff access required/.test(res.body?.message))) {
        failures.push(`${r.id}: ${res.status} ${res.body?.message}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('lets the Owner through every staff route', async () => {
    const failures = [];
    for (const r of STAFF_ROUTES) await expectAccess(r, owner, true, failures, `owner ${r.id}`);
    expect(failures).toEqual([]);
  });
});

describe('generic permission matrix (probe role)', () => {
  let probeRoleId: number;
  let probe: { id: number; email: string; token: string };
  let deniedWrites = 0;

  beforeAll(async () => {
    const role = await call('POST', '/admin/roles', owner.token, { name: 'E2E Probe', permissions: [] });
    expect(role.status).toBe(201);
    probeRoleId = role.body.id;
    probe = await createStaff('e2e-probe@test.local', probeRoleId);
  });

  it('each route opens with exactly its required permissions, and not without any one of them', async () => {
    const failures: string[] = [];
    const ownerOnly = new Set<string>(OWNER_ONLY_PERMISSIONS);
    const check = async (r: RouteInfo, perms: string[], allowed: boolean, why: string) => {
      await setRolePermissions(probeRoleId, perms);
      if (!allowed && r.method !== 'GET') deniedWrites++;
      await expectAccess(r, probe, allowed, failures, `${r.id} [${why}]`);
    };

    for (const r of STAFF_ROUTES) {
      const listed = r.permissions || [];
      if (r.policy === 'staff') {
        await check(r, [], true, 'any staff, no permissions');
      } else if (r.policy === 'permissions') {
        const needsOwner = listed.some((p) => ownerOnly.has(p));
        if (needsOwner) {
          // owner-only permissions can't be granted: even everything else isn't enough
          await check(r, GRANTABLE, false, 'all grantable, still owner-only');
        } else {
          await check(r, listed, true, `exactly ${listed.join('+')}`);
          for (const p of listed) {
            await check(r, GRANTABLE.filter((x) => x !== p), false, `all but ${p}`);
          }
        }
      } else if (r.policy === 'any-permission') {
        for (const p of listed.filter((x) => !ownerOnly.has(x))) {
          await check(r, [p], true, `only ${p}`);
        }
        await check(r, GRANTABLE.filter((x) => !listed.includes(x)), false, 'none of them');
      }
    }
    await setRolePermissions(probeRoleId, []);
    expect(failures).toEqual([]);
  });

  it('recorded every refused write in the audit log (and no refused read)', async () => {
    const [{ writes }] = await ds.query(
      `SELECT count(*)::int AS writes FROM audit_logs
       WHERE "actorId" = $1 AND success = false AND "statusCode" = 403 AND method <> 'GET'`,
      [probe.id],
    );
    expect(writes).toBe(deniedWrites);
    const [{ reads }] = await ds.query(
      `SELECT count(*)::int AS reads FROM audit_logs WHERE "actorId" = $1 AND method = 'GET'`,
      [probe.id],
    );
    expect(reads).toBe(0);
    const row = (
      await ds.query(
        `SELECT "actorRole", error FROM audit_logs WHERE "actorId" = $1 AND success = false LIMIT 1`,
        [probe.id],
      )
    )[0];
    expect(row.actorRole).toBe('E2E Probe');
    expect(row.error).toMatch(GUARD_DENIAL);
  });
});

describe('built-in roles x every staff route', () => {
  const staff: Record<string, { id: number; email: string; token: string }> = {};

  beforeAll(async () => {
    for (const def of BUILT_IN_ROLES.filter((d) => d.key !== OWNER_ROLE_KEY)) {
      staff[def.key] = await createStaff(`e2e-${def.key}@test.local`, roleIds[def.key]);
    }
  });

  it.each(BUILT_IN_ROLES.filter((d) => d.key !== OWNER_ROLE_KEY).map((d) => [d.name, d.key]))(
    '%s: every staff route matches its default permissions',
    async (_name, key) => {
      const def = BUILT_IN_ROLES.find((d) => d.key === key);
      const perms = new Set<string>(def.defaultPermissions);
      const failures: string[] = [];
      for (const r of STAFF_ROUTES) {
        await expectAccess(r, staff[key], satisfies(r, perms), failures, `${key} ${r.id}`);
      }
      expect(failures).toEqual([]);
    },
  );

  // What each role is FOR, written down independently of the permission
  // mapping - a change that breaks one of these is a business decision.
  const INTENT: [string, string, boolean][] = [
    // Manager: runs the shop, but no staff/roles, audit, deletes or syncs
    ['manager', 'GET /admin/staff', true],
    ['manager', 'GET /admin/roles', true],
    ['manager', 'POST /admin/staff', false],
    ['manager', 'PATCH /admin/staff/:id', false],
    ['manager', 'POST /admin/roles', false],
    ['manager', 'GET /admin/permissions', false],
    ['manager', 'GET /admin/audit-logs', false],
    ['manager', 'DELETE /admin/delete-product/:id', false],
    ['manager', 'PUT /admin/delete-history/:id', false],
    ['manager', 'DELETE /admin/delete-category/:id', false],
    ['manager', 'PUT /admin/sync-sales-count', false],
    ['manager', 'POST /admin/add-product', true],
    ['manager', 'PUT /admin/update-discount', true],
    ['manager', 'POST /admin/add-coupon', true],
    ['manager', 'PATCH /admin/update-buying-history-status-by-token/:token', true],
    // Order Staff: fulfilment and support only
    ['order_staff', 'GET /admin/get-grouped-buying-history', true],
    ['order_staff', 'PATCH /admin/update-buying-history-status-by-token/:token', true],
    ['order_staff', 'POST /admin/create-pathao-order', true],
    ['order_staff', 'PATCH /admin/approve-request', true],
    ['order_staff', 'PUT /admin/delete-history/:id', false],
    ['order_staff', 'POST /admin/add-product', false],
    ['order_staff', 'PUT /admin/update-product-stock/:id', false],
    ['order_staff', 'PUT /admin/update-discount', false],
    ['order_staff', 'GET /admin/get-coupons', false],
    ['order_staff', 'GET /admin/staff', false],
    // Content Editor: products, catalog, storefront - no orders, customers, money
    ['content_editor', 'POST /admin/add-product', true],
    ['content_editor', 'PUT /admin/publish-product/:id', true],
    ['content_editor', 'PUT /admin/home-sections', true],
    ['content_editor', 'GET /admin/cloudinary-signature', true],
    ['content_editor', 'GET /admin/dashboard-stats', false],
    ['content_editor', 'GET /admin/get-grouped-buying-history', false],
    ['content_editor', 'GET /admin/get-all-users', false],
    ['content_editor', 'GET /admin/admin-all-carts', false],
    ['content_editor', 'DELETE /admin/delete-product/:id', false],
    ['content_editor', 'PUT /admin/update-discount', false],
  ];

  it.each(INTENT)('%s -> %s allowed=%s', async (key, routeKey, allowed) => {
    const failures: string[] = [];
    await expectAccess(route(routeKey), staff[key], allowed, failures, `${key} ${routeKey}`);
    expect(failures).toEqual([]);
  });

  it('withholds revenue from roles without finance:view', async () => {
    const manager = await call('GET', '/admin/dashboard-stats', staff.manager.token);
    expect(manager.status).toBe(200);
    expect(manager.body.totalSales).not.toBeNull();

    const orders = await call('GET', '/admin/dashboard-stats', staff.order_staff.token);
    expect(orders.status).toBe(200);
    expect(orders.body.totalSales).toBeNull();
    expect(orders.body.avgOrderValue).toBeNull();
    expect(typeof orders.body.totalOrders).toBe('number');
  });

  it('a role change takes effect on the very next request (no re-login)', async () => {
    const ce = staff.content_editor;
    expect(isGuardDenied(await call('GET', '/admin/get-coupons', ce.token))).toBe(true);
    const def = BUILT_IN_ROLES.find((d) => d.key === 'content_editor');
    await setRolePermissions(roleIds.content_editor, [...def.defaultPermissions, P.COUPONS_VIEW]);
    expect(passedGuard(await call('GET', '/admin/get-coupons', ce.token))).toBe(true);
    await setRolePermissions(roleIds.content_editor, def.defaultPermissions);
    expect(isGuardDenied(await call('GET', '/admin/get-coupons', ce.token))).toBe(true);
  });
});

describe('staff & role management rules', () => {
  it('refuses owner-only permissions, unknown permissions and edits to locked roles', async () => {
    for (const perm of OWNER_ONLY_PERMISSIONS) {
      const res = await call('POST', '/admin/roles', owner.token, { name: `Sneaky ${perm}`, permissions: [perm] });
      expect(res.status).toBe(400);
    }
    expect((await call('POST', '/admin/roles', owner.token, { name: 'Bogus', permissions: ['orders:everything'] })).status).toBe(400);
    expect((await call('PATCH', `/admin/roles/${roleIds[OWNER_ROLE_KEY]}`, owner.token, { description: 'x' })).status).toBe(403);
    expect((await call('PATCH', `/admin/roles/${roleIds.manager}`, owner.token, { name: 'Boss' })).status).toBe(403);
    expect((await call('DELETE', `/admin/roles/${roleIds.manager}`, owner.token)).status).toBe(403);
    expect((await call('POST', '/admin/roles', owner.token, { name: 'Manager', permissions: [] })).status).toBe(409);
    // the legacy Manage Roles endpoints can't touch built-ins either (they may
    // report failure inside a 200 body, so check the role survived)
    await call('DELETE', `/admin/delete-role/${roleIds.manager}`, owner.token);
    await call('PATCH', `/admin/update-role/${roleIds.manager}`, owner.token, { name: 'boss' });
    const [still] = await ds.query('SELECT name FROM roles WHERE id = $1', [roleIds.manager]);
    expect(still?.name).toBe('Manager');
  });

  it('refuses unexpected fields, guest identities and self-changes', async () => {
    const extra = await call('POST', '/admin/staff', owner.token, {
      name: 'Extra', email: 'e2e-extra@test.local', password: PASSWORD, roleId: roleIds.manager, role: 'admin',
    });
    expect(extra.status).toBe(400);

    const guestId = await insertUser('guest1795000000000123@tahamsbd.com');
    expect(guestId).toBeGreaterThan(0);
    const guest = await call('POST', '/admin/staff/promote', owner.token, {
      email: 'guest1795000000000123@tahamsbd.com', roleId: roleIds.order_staff,
    });
    expect(guest.status).toBe(400);

    expect((await call('PATCH', `/admin/staff/${owner.id}`, owner.token, { active: false })).status).toBe(403);
    expect((await call('DELETE', `/admin/staff/${owner.id}`, owner.token)).status).toBe(403);
  });

  it('a role in use cannot be deleted; an unused custom role can', async () => {
    const role = await call('POST', '/admin/roles', owner.token, { name: 'E2E Temp', permissions: [P.ORDERS_VIEW] });
    expect(role.status).toBe(201);
    const member = await createStaff('e2e-temp@test.local', role.body.id);
    expect((await call('DELETE', `/admin/roles/${role.body.id}`, owner.token)).status).toBe(409);
    expect((await call('DELETE', `/admin/staff/${member.id}`, owner.token)).status).toBe(200);
    expect((await call('DELETE', `/admin/roles/${role.body.id}`, owner.token)).status).toBe(200);
  });

  it('suspension, password reset and removal end sessions everywhere', async () => {
    const s = await createStaff('e2e-session@test.local', roleIds.order_staff);
    const second = await signin(s.email, PASSWORD); // another device

    expect((await call('PATCH', `/admin/staff/${s.id}`, owner.token, { active: false })).status).toBe(200);
    expect((await call('GET', '/admin/me', s.token)).status).toBe(401);
    expect((await call('GET', '/admin/me', second)).status).toBe(401);

    expect((await call('PATCH', `/admin/staff/${s.id}`, owner.token, { active: true })).status).toBe(200);
    expect((await call('GET', '/admin/me', s.token)).status).toBe(401); // old sessions stay dead
    const fresh = await signin(s.email, PASSWORD);
    expect((await call('GET', '/admin/me', fresh)).body.isStaff).toBe(true);

    expect((await call('POST', `/admin/staff/${s.id}/password`, owner.token, { password: 'E2e-New-Pass-2026' })).status).toBe(201);
    expect((await call('GET', '/admin/me', fresh)).status).toBe(401);
    const afterReset = await signin(s.email, 'E2e-New-Pass-2026');

    expect((await call('DELETE', `/admin/staff/${s.id}`, owner.token)).status).toBe(200);
    expect((await call('GET', '/admin/me', afterReset)).status).toBe(401);
    const asCustomer = await signin(s.email, 'E2e-New-Pass-2026');
    const me = await call('GET', '/admin/me', asCustomer);
    expect(me.status).toBe(200);
    expect(me.body.isStaff).toBe(false);
  });

  it('a removed Owner is not re-granted Owner by the boot backfill', async () => {
    const o2 = await createStaff('e2e-owner2@test.local', roleIds[OWNER_ROLE_KEY]);
    let [row] = await ds.query('SELECT role FROM users WHERE id = $1', [o2.id]);
    expect(row.role).toBe('admin'); // legacy column kept in step
    expect((await call('DELETE', `/admin/staff/${o2.id}`, owner.token)).status).toBe(200);
    [row] = await ds.query('SELECT role, "staffRoleId" FROM users WHERE id = $1', [o2.id]);
    expect(row).toEqual({ role: 'customer', staffRoleId: null });

    const { RbacService } = await import('src/Rbac/rbac.service');
    await app.get(RbacService, { strict: false }).onModuleInit(); // what a restart runs
    [row] = await ds.query('SELECT role, "staffRoleId" FROM users WHERE id = $1', [o2.id]);
    expect(row.staffRoleId).toBeNull();
  });

  it('two Owners demoting each other at once: exactly one change goes through', async () => {
    const a = await createStaff('e2e-race-a@test.local', roleIds[OWNER_ROLE_KEY]);
    const b = await createStaff('e2e-race-b@test.local', roleIds[OWNER_ROLE_KEY]);
    const [ra, rb] = await Promise.all([
      call('PATCH', `/admin/staff/${b.id}`, a.token, { roleId: roleIds.manager }),
      call('PATCH', `/admin/staff/${a.id}`, b.token, { roleId: roleIds.manager }),
    ]);
    expect([ra.status, rb.status].sort()).toEqual([200, 403]);
    const owners = await ds.query(
      `SELECT id FROM users WHERE "staffRoleId" = $1 AND "staffActive" = true AND id = ANY($2)`,
      [roleIds[OWNER_ROLE_KEY], [a.id, b.id]],
    );
    expect(owners).toHaveLength(1);
  });

  it('audits successful changes with before/after and redacts passwords', async () => {
    const s = await createStaff('e2e-audited@test.local', roleIds.content_editor);
    await call('PATCH', `/admin/staff/${s.id}`, owner.token, { roleId: roleIds.order_staff });

    const logs = await call('GET', `/admin/audit-logs?entity=user&entityId=${s.id}`, owner.token);
    expect(logs.status).toBe(200);
    const created = logs.body.data.find((l) => l.action === 'staff.create');
    expect(created.success).toBe(true);
    expect(created.body.password).toBe('[redacted]');
    const changed = logs.body.data.find((l) => l.action === 'staff.update');
    expect(changed.changes.role).toEqual({ from: 'Content Editor', to: 'Order Staff' });
    expect(changed.actorEmail).toBe(owner.email);
  });
});
