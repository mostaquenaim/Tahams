/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { BuyingHistoryEntity } from './buyingHistory.entity';

@Entity('courier-info')
export class CourierInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  consignment_id: string;

  @Column({ nullable: true })
  merchant_order_id: string;

  @Column({ nullable: true })
  order_status: string;

  @Column({ nullable: true })
  delivery_fee: number;

  @Column({ nullable: true })
  tracking_number: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToOne(() => BuyingHistoryEntity)
  @JoinColumn()
  buyingHistory: BuyingHistoryEntity;
}
