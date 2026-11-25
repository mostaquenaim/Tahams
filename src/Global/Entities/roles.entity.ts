/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RolePermissionEntity } from './role-permission.entity';

// A staff role: a named bundle of permissions (see src/Rbac/permissions.ts).
// Customers have no role (users.staffRoleId is null).
@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // Stable machine key ('owner', 'manager', ...). Nullable only because
  // rows created by the old Manage Roles page predate it.
  @Column({ nullable: true, unique: true })
  key: string;

  @Column({ nullable: true })
  description: string;

  // Built-in roles can't be deleted or renamed. The Owner (key 'owner') is
  // additionally locked: its permissions are implicitly "everything".
  @Column({ default: false })
  isSystem: boolean;

  // Set once a built-in role's default permissions have been applied, so
  // boot never re-applies them over an owner's later edits.
  @Column({ type: 'timestamp', nullable: true })
  defaultsAppliedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RolePermissionEntity, (rp) => rp.role)
  permissions: RolePermissionEntity[];
}
