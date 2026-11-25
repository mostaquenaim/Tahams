import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { AuditLogEntity } from 'src/Global/Entities/audit-log.entity';

export const AUDIT_RETENTION_DAYS = 180;

const SECRET_KEY = /pass(word)?|token|secret|otp|signature|authorization|cookie|api[-_]?key/i;
const MAX_STRING = 2000;
const MAX_ARRAY = 50;
const MAX_DEPTH = 5;
const MAX_JSON = 16 * 1024;

// Redact secrets and bound the size of anything we persist from a request.
export function sanitizeForAudit(value: any, depth = 0): any {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    return value.length > MAX_STRING
      ? value.slice(0, MAX_STRING) + `…[+${value.length - MAX_STRING} chars]`
      : value;
  }
  if (typeof value !== 'object') return value;
  if (Buffer.isBuffer(value)) return `[binary ${value.length} bytes]`;
  if (depth >= MAX_DEPTH) return '[nested]';
  if (Array.isArray(value)) {
    const out = value.slice(0, MAX_ARRAY).map((v) => sanitizeForAudit(v, depth + 1));
    if (value.length > MAX_ARRAY) out.push(`…[+${value.length - MAX_ARRAY} items]`);
    return out;
  }
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(value)) {
    out[k] = SECRET_KEY.test(k) ? '[redacted]' : sanitizeForAudit(v, depth + 1);
  }
  return out;
}

function boundJson(value: any): any {
  if (value === undefined) return null;
  try {
    const json = JSON.stringify(value);
    if (json === undefined) return null;
    if (json.length <= MAX_JSON) return value;
    return { truncated: true, preview: json.slice(0, MAX_JSON) };
  } catch {
    return { unserializable: true };
  }
}

export type AuditRecord = Omit<AuditLogEntity, 'id' | 'createdAt'>;

@Injectable()
export class AuditService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AuditService.name);
  private purgeTimer: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly repo: Repository<AuditLogEntity>,
  ) {}

  onModuleInit() {
    // purge on boot and then daily; never keeps the process alive
    void this.purgeOld();
    this.purgeTimer = setInterval(() => void this.purgeOld(), 24 * 3600 * 1000);
    this.purgeTimer.unref?.();
  }

  onModuleDestroy() {
    if (this.purgeTimer) clearInterval(this.purgeTimer);
  }

  // Never throws: an audit failure must not fail (or slow down) the request
  // it describes. Failures are logged loudly instead.
  async write(record: Partial<AuditRecord>): Promise<void> {
    try {
      await this.repo.insert({
        ...record,
        params: boundJson(sanitizeForAudit(record.params)),
        body: boundJson(sanitizeForAudit(record.body)),
        changes: boundJson(sanitizeForAudit(record.changes)),
        error: record.error ? String(record.error).slice(0, MAX_STRING) : null,
        userAgent: record.userAgent
          ? String(record.userAgent).slice(0, 500)
          : null,
      } as any);
    } catch (err: any) {
      this.logger.error(
        `AUDIT WRITE FAILED for ${record.action} by ${record.actorEmail}: ${err?.message}`,
      );
    }
  }

  async list(filters: {
    page?: number;
    limit?: number;
    actorId?: number;
    action?: string;
    entity?: string;
    entityId?: string;
    from?: string;
    to?: string;
  }) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 25));

    const qb = this.repo.createQueryBuilder('a').orderBy('a.createdAt', 'DESC');
    if (filters.actorId) qb.andWhere('a.actorId = :actorId', { actorId: Number(filters.actorId) });
    if (filters.action) qb.andWhere('a.action ILIKE :action', { action: `%${filters.action}%` });
    if (filters.entity) qb.andWhere('a.entity = :entity', { entity: filters.entity });
    if (filters.entityId) qb.andWhere('a.entityId = :entityId', { entityId: String(filters.entityId) });
    if (filters.from) qb.andWhere('a.createdAt >= :from', { from: new Date(filters.from) });
    if (filters.to) qb.andWhere('a.createdAt <= :to', { to: new Date(filters.to) });

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  private async purgeOld() {
    try {
      const cutoff = new Date(Date.now() - AUDIT_RETENTION_DAYS * 24 * 3600 * 1000);
      const res = await this.repo.delete({ createdAt: LessThan(cutoff) });
      if (res.affected) this.logger.log(`Audit: purged ${res.affected} row(s) older than ${AUDIT_RETENTION_DAYS} days`);
    } catch (err: any) {
      this.logger.error(`Audit purge failed: ${err?.message}`);
    }
  }
}
