/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { RoleEntity } from './roles.entity';

// One permission key (see src/Rbac/permissions.ts) granted to one role.
@Entity('role_permissions')
@Unique(['roleId', 'permission'])
export class RolePermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  roleId: number;

  @ManyToOne(() => RoleEntity, (role) => role.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: RoleEntity;

  @Column()
  permission: string;
}
