/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BuyingHistoryEntity } from './buyingHistory.entity';

@Entity('payment-method')
export class PaymentMethodEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @OneToMany(() => BuyingHistoryEntity, (buyingHistory) => buyingHistory.paymentMethod)
    buyingHistories: BuyingHistoryEntity[]

}
