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
import { PaymentMethodsController } from 'src/Admin/payment-methods/payment-methods.controller';
import { ACCESS_POLICY_KEY, PERMISSIONS_KEY } from './access.decorators';

// Every HTTP route the app serves, read from controller metadata. Used by
// the unit check (route-policy.spec.ts) and the live role matrix
// (test/rbac.e2e-spec.ts), so both always see the same list.
//
// ADD NEW CONTROLLERS HERE.
export const CONTROLLERS = [
  AdminController,
  CustomerController,
  EmployeeController,
  RbacController,
  PaymentMethodsController,
];

export type RouteInfo = {
  id: string; // "GET /admin/path (Controller.method)"
  key: string; // "GET /admin/path"
  method: string; // GET, POST, ...
  path: string; // /admin/path/:id (no global /api prefix)
  policy: string | undefined;
  permissions: string[] | undefined;
  guards: unknown[];
  legacyRoles: unknown;
  controller: any;
  handlerName: string;
  handler: (...args: any[]) => any;
};

export const routesOf = (controller: any): RouteInfo[] => {
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
      const method =
        RequestMethod[Reflect.getMetadata(METHOD_METADATA, handler)];
      const routePath = Reflect.getMetadata(PATH_METADATA, handler);
      const path = `/${base}/${routePath}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
      const key = `${method} ${path}`;
      return {
        id: `${key} (${controller.name}.${name})`,
        key,
        method,
        path,
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
        controller,
        handlerName: name,
        handler,
      };
    });
};

export const allRoutes = (): RouteInfo[] => CONTROLLERS.flatMap(routesOf);

// Routes that only staff can pass (the global guard checks a staff role).
export const STAFF_POLICIES = ['staff', 'permissions', 'any-permission'];
export const isStaffRoute = (r: RouteInfo) =>
  STAFF_POLICIES.includes(r.policy as string);
