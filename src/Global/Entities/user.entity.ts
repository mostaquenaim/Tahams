/* eslint-disable prettier/prettier */
import { CartsEntity } from 'src/Global/Entities/cart.entity';
import { WishEntity } from 'src/Global/Entities/wish.entity';
import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RoleEntity } from './roles.entity';
import { ViewProductEntity } from './viewProduct.entity';
import { MessageEntity } from './messages.entity';
import { UnreadMessageEntity } from './unreadMessage.entity';
import { CustomizationRequestEntity } from './customization-request.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  uniqueId: string;

  @Column({ nullable: true })
  password: string;

  @Column({ unique: true })
  email: string;

  // Legacy coarse role ('admin' / 'customer'). Still read by the legacy
  // admin guard until RBAC phase 2; staff access is staffRoleId below.
  @Column({ default: 'customer' })
  role: string;

  // ---- staff access (RBAC) - NEVER settable from a request body ----
  // Null for customers. Only the staff-management API may change these.
  @Column({ nullable: true })
  staffRoleId: number;

  @ManyToOne(() => RoleEntity, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'staffRoleId' })
  staffRole: RoleEntity;

  // Lets an Owner suspend a staff member without removing their role.
  @Column({ default: true })
  staffActive: boolean;

  // Bumped on role change / deactivation / password reset. Every JWT carries
  // the version it was issued with (`tv`); a mismatch is rejected, so access
  // changes take effect on the very next request instead of in 7 days.
  @Column({ default: 0 })
  tokenVersion: number;

  @Column({ nullable: true })
  mbl_no: string;

  @Column({ nullable: true })
  filename: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  postal_code: string;

  @Column({ nullable: true })
  date_of_birth: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  loggedInWith: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // relationships
  // relationships
  // relationships

  @OneToMany(() => CustomizationRequestEntity, (customReq) => customReq.user)
  customReqs: CustomizationRequestEntity[];

  @OneToMany(() => CartsEntity, (cart) => cart.customer)
  carts: CartsEntity[];

  @OneToMany(() => WishEntity, (wish) => wish.customer)
  wishes: WishEntity[];

  @OneToMany(() => ViewProductEntity, (view) => view.user)
  views: ViewProductEntity[];

  @OneToMany(() => MessageEntity, (msg) => msg.sender)
  msgss: MessageEntity[];

  @OneToMany(() => MessageEntity, (msg) => msg.receiver)
  msgsr: MessageEntity[];

  @OneToMany(() => UnreadMessageEntity, (msg) => msg.user)
  msgcnt: UnreadMessageEntity[];
}
