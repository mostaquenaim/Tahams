/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BuyingHistoryEntity } from './buyingHistory.entity';

@Entity('delivery-status')
export class DeliveryStatusEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @OneToMany(() => BuyingHistoryEntity, (buyingHistory) => buyingHistory.deliveryStatus)
    buyingHistories: BuyingHistoryEntity[]

}
