/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { DeliveryStatusEntity } from './deliveryStatus.entity';
import { CartsEntity } from './cart.entity';

@Entity('buying-history')
export class BuyingHistoryEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    trackingToken: string

    @Column()
    Address: string 

    @Column()
    BuyingDate: Date

    @Column({nullable:true})
    Payment: string

    @Column()
    PaymentDone: string

    @ManyToOne(() => DeliveryStatusEntity, (deliveryStatus) => deliveryStatus.buyingHistories)
    deliveryStatus: DeliveryStatusEntity

    @OneToMany(() => CartsEntity, (cart) => cart.history)
    carts: CartsEntity[]
}
