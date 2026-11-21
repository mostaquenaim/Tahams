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
import { ROLES_KEY } from 'src/Admin/decorators/roles.decorator';
import { ACCESS_POLICY_KEY, PERMISSIONS_KEY } from './access.decorators';
import { isPermission, OWNER_ONLY_PERMISSIONS } from './permissions';

// Every HTTP route of every controller must declare an access policy
// (deny-by-default is enforced at runtime by AccessPolicyGuard; this makes a
// missing one fail CI instead of 403-ing in production).
//
// ADD NEW CONTROLLERS HERE.
const CONTROLLERS = [AdminController, CustomerController, EmployeeController];

type Route = {
  id: string;
  policy: string | undefined;
  permissions: string[] | undefined;
  legacyRoles: string[] | undefined;
  guards: unknown[];
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
      return {
        id: `${method} /${base}/${path} (${controller.name}.${name})`.replace(
          /\/+/g,
          '/',
        ),
        policy:
          Reflect.getMetadata(ACCESS_POLICY_KEY, handler) ??
          Reflect.getMetadata(ACCESS_POLICY_KEY, controller),
        permissions: Reflect.getMetadata(PERMISSIONS_KEY, handler),
        legacyRoles: Reflect.getMetadata(ROLES_KEY, handler),
        guards: [
          ...(Reflect.getMetadata(GUARDS_METADATA, handler) ?? []),
          ...(Reflect.getMetadata(GUARDS_METADATA, controller) ?? []),
        ],
      };
    });
};

const ALL_ROUTES = CONTROLLERS.flatMap(routesOf);

describe('route access policies', () => {
  it('finds the routes (sanity check)', () => {
    expect(ALL_ROUTES.length).toBeGreaterThan(100);
  });

  it('every route declares an access policy', () => {
    const missing = ALL_ROUTES.filter(
      (r) => !r.policy && !(r.legacyRoles && r.legacyRoles.length),
    ).map((r) => r.id);
    expect(missing).toEqual([]);
  });

  it('no route mixes a policy with legacy @Roles', () => {
    const mixed = ALL_ROUTES.filter(
      (r) => r.policy && r.legacyRoles && r.legacyRoles.length,
    ).map((r) => r.id);
    expect(mixed).toEqual([]);
  });

  it('legacy @Roles routes really have their guards', () => {
    const unguarded = ALL_ROUTES.filter(
      (r) => r.legacyRoles?.length && r.guards.length < 2,
    ).map((r) => r.id);
    expect(unguarded).toEqual([]);
  });

  it('@SelfGuarded routes really have a guard', () => {
    const unguarded = ALL_ROUTES.filter(
      (r) => r.policy === 'self-guarded' && r.guards.length === 0,
    ).map((r) => r.id);
    expect(unguarded).toEqual([]);
  });

  it('@Public routes carry no guards (a guard there means the policy is wrong)', () => {
    const odd = ALL_ROUTES.filter(
      (r) => r.policy === 'public' && r.guards.length > 0,
    ).map((r) => r.id);
    expect(odd).toEqual([]);
  });

  it('@RequirePermissions only uses real permission keys', () => {
    const bad = ALL_ROUTES.filter(
      (r) =>
        r.policy === 'permissions' &&
        (!r.permissions?.length || !r.permissions.every(isPermission)),
    ).map((r) => r.id);
    expect(bad).toEqual([]);
  });

  it('owner-only permissions are a subset of the catalog', () => {
    expect(OWNER_ONLY_PERMISSIONS.every(isPermission)).toBe(true);
  });
});
