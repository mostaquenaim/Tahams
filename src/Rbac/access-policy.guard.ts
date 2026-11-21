import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_POLICY_KEY,
  AccessPolicy,
  PERMISSIONS_KEY,
} from './access.decorators';
import { Permission } from './permissions';
import { RbacService, TokenRejectedError } from './rbac.service';

// Registered globally (APP_GUARD), so it runs before every route's own
// guards and interceptors. Deny by default: a route with no declared
// policy is refused (and route-policy.spec.ts fails CI for it).
//
// On success for staff policies it sets:
//   req.user  - the verified JWT payload
//   req.staff - the caller's StaffAccess (role + permissions), fresh from
//               the DB on this request
@Injectable()
export class AccessPolicyGuard implements CanActivate {
  private readonly logger = new Logger(AccessPolicyGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly rbac: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') return true;

    const handler = context.getHandler();
    const cls = context.getClass();
    const req = context.switchToHttp().getRequest();
    const policy = this.reflector.getAllAndOverride<AccessPolicy>(
      ACCESS_POLICY_KEY,
      [handler, cls],
    );

    switch (policy) {
      case 'public':
      case 'self-guarded':
        return true;

      case 'authenticated':
        req.user = await this.authenticate(req);
        return true;

      case 'staff':
      case 'permissions':
      case 'any-permission': {
        req.user = await this.authenticate(req);

        const access = await this.rbac.getStaffAccess(Number(req.user.sub));
        if (!access) throw new ForbiddenException('Staff access required');

        if (policy !== 'staff') {
          const listed =
            this.reflector.get<Permission[]>(PERMISSIONS_KEY, handler) || [];
          if (listed.length === 0) {
            // Can't happen via the decorators (they throw on an empty
            // list), but never let a malformed route fall open.
            throw new ForbiddenException('Access denied');
          }
          const ok =
            policy === 'permissions'
              ? this.rbac.hasAllPermissions(access, listed)
              : this.rbac.hasAnyPermission(access, listed);
          if (!ok) {
            const held = new Set(access.permissions);
            const missing = listed.filter((p) => !held.has(p));
            throw new ForbiddenException(
              policy === 'permissions'
                ? `Missing permission: ${missing.join(', ')}`
                : `Requires one of: ${listed.join(', ')}`,
            );
          }
        }

        req.staff = access;
        return true;
      }

      default:
        this.logger.error(
          `Denied ${req?.method} ${req?.originalUrl}: ${cls?.name}.${handler?.name} declares no access policy`,
        );
        throw new ForbiddenException('Access denied');
    }
  }

  private async authenticate(req: any) {
    const header: string | undefined = req.headers?.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new UnauthorizedException('Missing token');

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    try {
      await this.rbac.validateTokenPayload(payload);
    } catch (err) {
      if (err instanceof TokenRejectedError) {
        throw new UnauthorizedException(err.message);
      }
      throw err;
    }
    return payload;
  }
}
