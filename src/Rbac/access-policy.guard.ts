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
import { RbacService, StaffAccess, TokenRejectedError } from './rbac.service';
import { AuditService } from './audit.service';

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
// the staff member a permission check refused, for the audit row
const DENIED_ACTOR = Symbol('rbacDeniedActor');

// Registered globally (APP_GUARD), so it runs before every route's own
// guards and interceptors. Deny by default: a route with no declared
// policy is refused (and route-policy.spec.ts fails CI for it).
//
// On success for staff policies it sets:
//   req.user  - the verified JWT payload
//   req.staff - the caller's StaffAccess (role + permissions), fresh from
//               the DB on this request
//
// A refused write (403) by a verified user is recorded in the audit log
// here, since the AuditInterceptor only runs for requests the guard lets
// through.
@Injectable()
export class AccessPolicyGuard implements CanActivate {
  private readonly logger = new Logger(AccessPolicyGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly rbac: RbacService,
    private readonly audit: AuditService,
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

        // Refusals happen here, before the AuditInterceptor ever runs, so
        // record refused WRITES from a verified identity ourselves. (401s -
        // no verified identity - are not recorded.)
        try {
          return await this.authorizeStaff(req, policy, handler);
        } catch (err) {
          if (err instanceof ForbiddenException) {
            await this.recordDenied(req, err.message);
          }
          throw err;
        }
      }

      default:
        this.logger.error(
          `Denied ${req?.method} ${req?.originalUrl}: ${cls?.name}.${handler?.name} declares no access policy`,
        );
        throw new ForbiddenException('Access denied');
    }
  }

  // Sets req.staff only when access is granted.
  private async authorizeStaff(
    req: any,
    policy: AccessPolicy,
    // eslint-disable-next-line @typescript-eslint/ban-types
    handler: Function,
  ): Promise<boolean> {
    const access = await this.rbac.getStaffAccess(Number(req.user.sub));
    if (!access) throw new ForbiddenException('Staff access required');

    if (policy !== 'staff') {
      const listed =
        this.reflector.get<Permission[]>(PERMISSIONS_KEY, handler) || [];
      if (listed.length === 0) {
        // Can't happen via the decorators (they throw on an empty
        // list), but never let a malformed route fall open.
        req[DENIED_ACTOR] = access;
        throw new ForbiddenException('Access denied');
      }
      const ok =
        policy === 'permissions'
          ? this.rbac.hasAllPermissions(access, listed)
          : this.rbac.hasAnyPermission(access, listed);
      if (!ok) {
        req[DENIED_ACTOR] = access;
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

  // Never throws (AuditService.write swallows its own failures), so the
  // client still gets the 403 it was going to get.
  private async recordDenied(req: any, message: string) {
    if (READ_METHODS.has(req.method)) return;
    const actor: StaffAccess | undefined = req[DENIED_ACTOR];
    const route = req.route?.path || req.originalUrl?.split('?')[0] || '';
    const forwarded = String(req.headers?.['x-forwarded-for'] || '')
      .split(',')[0]
      .trim();
    await this.audit.write({
      actorId: actor?.userId ?? (Number(req.user?.sub) || null),
      actorEmail: actor?.email ?? req.user?.email ?? null,
      actorRole: actor?.role?.name ?? null,
      action: `${req.method} ${route}`,
      method: req.method,
      route,
      params: req.params && Object.keys(req.params).length ? req.params : null,
      body: req.body && Object.keys(req.body).length ? req.body : null,
      success: false,
      statusCode: 403,
      error: message,
      ip: forwarded || req.ip || null,
      userAgent: req.headers?.['user-agent'] || null,
    });
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
