// auth/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    // console.log('Required Roles:', requiredRoles);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required, allow access
    } 

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // console.log('User Object:', user); // Debug entire user object

    if (!user) {
      throw new ForbiddenException(
        'User not authenticated - JWT guard may not be working',
      );
    }

    // Handle both 'role' (string) and 'roles' (array) properties
    const userRoles = user.roles || (user.role ? [user.role] : []);
    
    if (userRoles.length === 0) {
      throw new ForbiddenException('User has no roles assigned');
    }

    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role),
    );
    // console.log(
    //   `User roles: ${userRoles}, Required: ${requiredRoles}, Access: ${hasRequiredRole}`,
    // );

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Required roles: ${requiredRoles.join(', ')}, Your roles: ${userRoles.join(', ')}`
      );
    }

    return true;
  }
}