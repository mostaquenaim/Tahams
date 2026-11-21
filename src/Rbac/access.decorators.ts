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
//   @SelfGuarded()            the route authenticates itself via its own
//                             @UseGuards (Firebase / OrderAccess / legacy
//                             admin RolesGuard). The coverage test checks it
//                             really has guards.

export const ACCESS_POLICY_KEY = 'rbac:access-policy';
export const PERMISSIONS_KEY = 'rbac:permissions';

export type AccessPolicy =
  | 'public'
  | 'authenticated'
  | 'permissions'
  | 'self-guarded';

export const Public = () => SetMetadata(ACCESS_POLICY_KEY, 'public');

export const Authenticated = () =>
  SetMetadata(ACCESS_POLICY_KEY, 'authenticated');

export const SelfGuarded = () => SetMetadata(ACCESS_POLICY_KEY, 'self-guarded');

export const RequirePermissions = (...permissions: Permission[]) => {
  if (permissions.length === 0) {
    // An empty list would silently mean "any staff member" - make that an
    // explicit, separate decision instead of an accident.
    throw new Error('@RequirePermissions() needs at least one permission');
  }
  const setPolicy = SetMetadata(ACCESS_POLICY_KEY, 'permissions');
  const setPerms = SetMetadata(PERMISSIONS_KEY, permissions);
  return (target: any, key?: any, descriptor?: any) => {
    setPolicy(target, key, descriptor);
    setPerms(target, key, descriptor);
  };
};
