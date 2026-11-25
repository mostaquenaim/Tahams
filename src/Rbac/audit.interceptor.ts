import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { ACCESS_POLICY_KEY, AccessPolicy } from './access.decorators';
import { AuditService } from './audit.service';

// Staff-only policies: every write on these is audited.
const AUDITED_POLICIES: AccessPolicy[] = ['staff', 'permissions', 'any-permission'];
const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Optional, set by a controller to describe the action in business terms:
//   req.audit = { action: 'staff.promote', entity: 'user', entityId: 12, changes: {...} }
export interface AuditDetails {
  action?: string;
  entity?: string;
  entityId?: string | number;
  changes?: any;
}

// Registered globally (APP_INTERCEPTOR). Runs after the AccessPolicyGuard,
// so req.staff is the verified actor. The row is written BEFORE the
// response is sent (awaited), so a successful response always has its
// audit row; AuditService.write never throws, so auditing can't break a
// request.
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly audit: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') return next.handle();

    const req = context.switchToHttp().getRequest();
    const policy = this.reflector.getAllAndOverride<AccessPolicy>(
      ACCESS_POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (
      READ_METHODS.has(req.method) ||
      !AUDITED_POLICIES.includes(policy as AccessPolicy)
    ) {
      return next.handle();
    }

    const record = (success: boolean, statusCode: number, error?: string, result?: any) => {
      const d: AuditDetails = req.audit || {};
      const route = req.route?.path || req.originalUrl?.split('?')[0] || '';
      // Legacy handlers report failure inside a 2xx body ({ status: 409 })
      const bodyStatus =
        result && typeof result === 'object' && typeof result.status === 'number'
          ? result.status
          : null;
      const effectiveStatus = bodyStatus ?? statusCode;
      const forwarded = String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
      return this.audit.write({
        actorId: req.staff?.userId ?? (Number(req.user?.sub) || null),
        actorEmail: req.staff?.email ?? req.user?.email ?? null,
        actorRole: req.staff?.role?.name ?? null,
        action: d.action || `${req.method} ${route}`,
        method: req.method,
        route,
        entity: d.entity ?? null,
        entityId: d.entityId !== undefined && d.entityId !== null ? String(d.entityId) : null,
        params: req.params && Object.keys(req.params).length ? req.params : null,
        body: req.body && Object.keys(req.body).length ? req.body : null,
        changes: d.changes ?? null,
        success: success && effectiveStatus < 400,
        statusCode: effectiveStatus,
        error: error ?? (bodyStatus && bodyStatus >= 400 ? result?.message : null),
        ip: forwarded || req.ip || null,
        userAgent: req.headers?.['user-agent'] || null,
      });
    };

    const successStatus = req.method === 'POST' ? 201 : 200;
    return next.handle().pipe(
      mergeMap(async (result) => {
        await record(true, successStatus, undefined, result);
        return result;
      }),
      catchError((err) =>
        from(
          record(false, Number(err?.status) || 500, err?.message || 'error'),
        ).pipe(mergeMap(() => throwError(() => err))),
      ),
    );
  }
}
