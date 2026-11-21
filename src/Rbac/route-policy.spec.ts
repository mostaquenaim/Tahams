import 'reflect-metadata';
import {
  GUARDS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { AdminController } from 'src/Admin/Controllers/admin.controller';
import { CustomerController } from 'src/Customer/Controllers/customer.controller';
import { EmployeeController } from 'src/Employee/Controllers/employee.controller';
import { RbacController } from './rbac.controller';
import { ACCESS_POLICY_KEY, PERMISSIONS_KEY } from './access.decorators';
import { isPermission, OWNER_ONLY_PERMISSIONS, P } from './permissions';

// Every HTTP route of every controller must declare an access policy
// (deny-by-default is enforced at runtime by AccessPolicyGuard; this makes a
// missing one fail CI instead of 403-ing in production).
//
// ADD NEW CONTROLLERS HERE.
const CONTROLLERS = [
  AdminController,
  CustomerController,
  EmployeeController,
  RbacController,
];

const POLICIES = [
  'public',
  'authenticated',
  'staff',
  'permissions',
  'any-permission',
  'self-guarded',
];

type Route = {
  id: string;
  key: string; // "GET /admin/path"
  policy: string | undefined;
  permissions: string[] | undefined;
  guards: unknown[];
  legacyRoles: unknown;
};

const routesOf = (controller: any): Route[] => {
  const base = Reflect.getMetadata(PATH_METADATA, controller) ?? '';
  const proto = controller.prototype;
  return Object.getOwnPropertyNames(proto)
    .filter((name) => name !== 'constructor')
    .map((name) => ({ name, handler: proto[name] }))
    .filter(
      ({ handler }) =>
        typeof handler === 'function' &&
        Reflect.getMetadata(PATH_METADATA, handler) !== undefined,
    )
    .map(({ name, handler }) => {
      const method = RequestMethod[Reflect.getMetadata(METHOD_METADATA, handler)];
      const path = Reflect.getMetadata(PATH_METADATA, handler);
      const key = `${method} /${base}/${path}`.replace(/\/+/g, '/');
      return {
        id: `${key} (${controller.name}.${name})`,
        key,
        policy:
          Reflect.getMetadata(ACCESS_POLICY_KEY, handler) ??
          Reflect.getMetadata(ACCESS_POLICY_KEY, controller),
        permissions: Reflect.getMetadata(PERMISSIONS_KEY, handler),
        guards: [
          ...(Reflect.getMetadata(GUARDS_METADATA, handler) ?? []),
          ...(Reflect.getMetadata(GUARDS_METADATA, controller) ?? []),
        ],
        // the removed legacy @Roles('admin') decorator stored this key
        legacyRoles: Reflect.getMetadata('roles', handler),
      };
    });
};

const ALL_ROUTES = CONTROLLERS.flatMap(routesOf);
const byKey = (key: string) => {
  const r = ALL_ROUTES.find((x) => x.key === key);
  if (!r) throw new Error(`route not found: ${key}`);
  return r;
};

describe('route access policies', () => {
  it('finds the routes (sanity check)', () => {
    expect(ALL_ROUTES.length).toBeGreaterThan(100);
  });

  it('every route declares a known access policy', () => {
    const missing = ALL_ROUTES.filter(
      (r) => !POLICIES.includes(r.policy as string),
    ).map((r) => `${r.id} -> ${r.policy}`);
    expect(missing).toEqual([]);
  });

  it('no route still uses the removed legacy @Roles decorator', () => {
    expect(ALL_ROUTES.filter((r) => r.legacyRoles).map((r) => r.id)).toEqual(
      [],
    );
  });

  it('@SelfGuarded routes really have a guard', () => {
    const unguarded = ALL_ROUTES.filter(
      (r) => r.policy === 'self-guarded' && r.guards.length === 0,
    ).map((r) => r.id);
    expect(unguarded).toEqual([]);
  });

  it('only @SelfGuarded routes carry their own guards', () => {
    // anything else is authenticated by the global AccessPolicyGuard; an
    // extra route guard there means the policy is mislabelled
    const odd = ALL_ROUTES.filter(
      (r) => r.policy !== 'self-guarded' && r.guards.length > 0,
    ).map((r) => r.id);
    expect(odd).toEqual([]);
  });

  it('permission policies only use real permission keys', () => {
    const bad = ALL_ROUTES.filter(
      (r) =>
        (r.policy === 'permissions' || r.policy === 'any-permission') &&
        (!r.permissions?.length || !r.permissions.every(isPermission)),
    ).map((r) => r.id);
    expect(bad).toEqual([]);
  });

  it('owner-only permissions are a subset of the catalog', () => {
    expect(OWNER_ONLY_PERMISSIONS.every(isPermission)).toBe(true);
  });

  // Spot checks on the riskiest routes, so a wrong edit to the mapping is
  // caught here rather than in production.
  it.each([
    ['POST /admin/create', P.STAFF_MANAGE],
    ['POST /admin/create-role', P.ROLES_MANAGE],
    ['PATCH /admin/update-role/:id', P.ROLES_MANAGE],
    ['DELETE /admin/delete-role/:id', P.ROLES_MANAGE],
    ['DELETE /admin/delete-product/:id', P.PRODUCTS_DELETE],
    ['DELETE /admin/delete-category/:id', P.CATALOG_DELETE],
    ['PUT /admin/delete-history/:id', P.ORDERS_DELETE],
    ['PATCH /admin/update-buying-history-status-by-token/:token', P.ORDERS_UPDATE_STATUS],
    ['GET /admin/get-all-users', P.CUSTOMERS_VIEW],
    ['GET /admin/admin-all-carts', P.CUSTOMERS_VIEW],
    ['PUT /admin/sync-sales-count', P.SYSTEM_SYNC],
    ['PUT /admin/update-discount', P.PRICING_DISCOUNT],
    ['POST /admin/staff', P.STAFF_MANAGE],
    ['POST /admin/staff/promote', P.STAFF_MANAGE],
    ['PATCH /admin/staff/:id', P.STAFF_MANAGE],
    ['DELETE /admin/staff/:id', P.STAFF_MANAGE],
    ['POST /admin/staff/:id/password', P.STAFF_MANAGE],
    ['GET /admin/staff', P.STAFF_VIEW],
    ['POST /admin/roles', P.ROLES_MANAGE],
    ['PATCH /admin/roles/:id', P.ROLES_MANAGE],
    ['DELETE /admin/roles/:id', P.ROLES_MANAGE],
    ['GET /admin/audit-logs', P.AUDIT_VIEW],
  ])('%s requires %s', (key, perm) => {
    const r = byKey(key);
    expect(r.policy).toBe('permissions');
    expect(r.permissions).toEqual([perm]);
  });

  it.each([
    'GET /admin/view-all-products',
    'POST /admin/add-to-cart',
    'POST /admin/add-to-buy',
    'POST /admin/add-payment',
    'POST /admin/pathao-webhook',
    'GET /admin/get-buying-history-by-token/:token',
    'POST /admin/confirm-return-or-cancellation',
    'POST /admin/send-customize-tee-request',
    'POST /admin/signin',
    'POST /admin/firebase-signin',
    'POST /customer/create',
  ])('storefront / guest route %s stays public', (key) => {
    expect(byKey(key).policy).toBe('public');
  });
});
