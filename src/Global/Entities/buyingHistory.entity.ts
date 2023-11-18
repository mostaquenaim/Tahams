/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { DeliveryStatusEntity } from './deliveryStatus.entity';
import { CartsEntity } from './cart.entity';
import { PaymentMethodEntity } from './paymentMethod.entity';

@Entity('buying-history')
export class BuyingHistoryEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    trackingToken: string

    @Column()
    Address: string

    @Column()
    phone_no: string

    @Column()
    BuyingDate: Date

    @Column({nullable:true})
    PaymentDetails: string

    @Column({default:false})
    PaymentDone: boolean

    @ManyToOne(() => DeliveryStatusEntity, (deliveryStatus) => deliveryStatus.buyingHistories)
    deliveryStatus: DeliveryStatusEntity

    @ManyToOne(() => PaymentMethodEntity, (paymentMethod) => paymentMethod.buyingHistories)
    paymentMethod: PaymentMethodEntity

    @OneToMany(() => CartsEntity, (cart) => cart.history)
    carts: CartsEntity[]
}
