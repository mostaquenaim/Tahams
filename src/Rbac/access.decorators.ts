import { SetMetadata } from '@nestjs/common';
import { Permission } from './permissions';

// Every controller route must declare exactly ONE access policy. The global
// AccessPolicyGuard denies any route that declares none (deny by default),
// and src/Rbac/route-policy.spec.ts fails the test run if one is missing, so
// a forgotten guard can't ship.
//
//   @Public()                 anyone, no token (storefront, guest checkout,
//                             webhooks). Must not touch other people's data
//                             without its own proof (tracking token etc.).
//   @Authenticated()          any valid backend JWT (customer or staff).
//   @RequirePermissions(...)  active staff holding ALL listed permissions
//                             (the Owner holds every permission).
//   @RequireAnyPermission(...) active staff holding AT LEAST ONE of them
//                             (shared tools, e.g. the image-upload signature
//                             used by both products and content pages).
//   @StaffOnly()              any active staff member, no specific
//                             permission (own profile, "am I staff?").
//   @SelfGuarded()            the route authenticates itself via its own
//                             @UseGuards (Firebase / OrderAccess). The
//                             coverage test checks it really has guards.

export const ACCESS_POLICY_KEY = 'rbac:access-policy';
export const PERMISSIONS_KEY = 'rbac:permissions';

export type AccessPolicy =
  | 'public'
  | 'authenticated'
  | 'staff'
  | 'permissions'
  | 'any-permission'
  | 'self-guarded';

export const Public = () => SetMetadata(ACCESS_POLICY_KEY, 'public');

export const Authenticated = () =>
  SetMetadata(ACCESS_POLICY_KEY, 'authenticated');

export const SelfGuarded = () => SetMetadata(ACCESS_POLICY_KEY, 'self-guarded');

export const StaffOnly = () => SetMetadata(ACCESS_POLICY_KEY, 'staff');

const permissionPolicy =
  (policy: 'permissions' | 'any-permission', name: string) =>
  (...permissions: Permission[]) => {
    if (permissions.length === 0) {
      // An empty list would silently mean "any staff member" - that's
      // @StaffOnly(), an explicit, separate decision, never an accident.
      throw new Error(`@${name}() needs at least one permission`);
    }
    const setPolicy = SetMetadata(ACCESS_POLICY_KEY, policy);
    const setPerms = SetMetadata(PERMISSIONS_KEY, permissions);
    return (target: any, key?: any, descriptor?: any) => {
      setPolicy(target, key, descriptor);
      setPerms(target, key, descriptor);
    };
  };

export const RequirePermissions = permissionPolicy(
  'permissions',
  'RequirePermissions',
);

export const RequireAnyPermission = permissionPolicy(
  'any-permission',
  'RequireAnyPermission',
);
