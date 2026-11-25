/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

// One row per staff write (every non-GET request on a staff-only route),
// written by AuditInterceptor. Append-only: nothing in the app updates or
// deletes rows except the retention purge in AuditService.
@Entity('audit_logs')
@Index(['createdAt'])
@Index(['actorId', 'createdAt'])
@Index(['entity', 'entityId'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  actorId: number;

  @Column({ nullable: true })
  actorEmail: string;

  // role name at the time of the action (roles can be renamed later)
  @Column({ nullable: true })
  actorRole: string;

  // e.g. 'staff.promote', or 'PATCH /api/admin/order-note/:historyId' for
  // routes without a named action
  @Column()
  action: string;

  @Column()
  method: string;

  // route pattern, e.g. /api/admin/staff/:id
  @Column()
  route: string;

  @Column({ nullable: true })
  entity: string;

  @Column({ nullable: true })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  params: any;

  // request body with secrets redacted and large values truncated
  @Column({ type: 'jsonb', nullable: true })
  body: any;

  // structured before/after for named actions
  @Column({ type: 'jsonb', nullable: true })
  changes: any;

  @Column()
  success: boolean;

  @Column({ nullable: true })
  statusCode: number;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;
}
