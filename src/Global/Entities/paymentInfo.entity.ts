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

@Entity('payment-info')
export class PaymentInfo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable:true})
    bankName: string

    @Column({nullable:true})
    accountNumber: string

    @Column({nullable:true})
    mobileNumber: string

    @Column({nullable:true})
    screenshot: string

    @OneToOne(() => BuyingHistoryEntity)
    @JoinColumn()
    buyingHistory: BuyingHistoryEntity
    
}
