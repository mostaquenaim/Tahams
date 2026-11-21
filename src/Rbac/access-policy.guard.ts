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
import { ROLES_KEY } from 'src/Admin/decorators/roles.decorator';
import {
  ACCESS_POLICY_KEY,
  AccessPolicy,
  PERMISSIONS_KEY,
} from './access.decorators';
import { Permission } from './permissions';
import { RbacService, TokenRejectedError } from './rbac.service';

// Registered globally (APP_GUARD), so it runs before every route's own
// guards. Deny by default: a route with no declared policy is refused.
//
// Legacy routes still using @UseGuards(AuthGuard('jwt'), RolesGuard) +
// @Roles('admin') are passed through to those guards until RBAC phase 2
// moves them onto @RequirePermissions.
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
    const policy = this.reflector.getAllAndOverride<AccessPolicy>(
      ACCESS_POLICY_KEY,
      [handler, cls],
    );

    if (policy === 'public' || policy === 'self-guarded') return true;

    if (!policy) {
      const legacyRoles = this.reflector.get<string[]>(ROLES_KEY, handler);
      if (legacyRoles?.length) return true; // enforced by RolesGuard

      const req = context.switchToHttp().getRequest();
      this.logger.error(
        `Denied ${req?.method} ${req?.originalUrl}: ${cls?.name}.${handler?.name} declares no access policy`,
      );
      throw new ForbiddenException('Access denied');
    }

    const req = context.switchToHttp().getRequest();
    req.user = await this.authenticate(req);

    if (policy === 'authenticated') return true;

    // policy === 'permissions'
    const required =
      this.reflector.get<Permission[]>(PERMISSIONS_KEY, handler) || [];
    if (required.length === 0) {
      // Can't happen via the decorator (it throws on an empty list), but
      // never let a malformed route fall open.
      throw new ForbiddenException('Access denied');
    }

    const access = await this.rbac.getStaffAccess(Number(req.user.sub));
    if (!access) throw new ForbiddenException('Staff access required');

    if (!this.rbac.hasAllPermissions(access, required)) {
      const held = new Set(access.permissions);
      const missing = required.filter((p) => !held.has(p));
      throw new ForbiddenException(
        `Missing permission: ${missing.join(', ')}`,
      );
    }

    req.staff = access;
    return true;
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
