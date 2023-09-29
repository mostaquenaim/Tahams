/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { CustomerEntity } from 'src/Customer/Entities/customer.entity';
import { ProductEntity } from './product.entity';
import { DeliveryStatusEntity } from './deliveryStatus.entity';

@Entity('buying-history')
export class BuyingHistoryEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    trackingToken: string

    @Column()
    Address: string 

    @Column()
    Quantity: number

    @Column()
    ProductName: string

    @Column()
    UnitPrice: number

    @Column()
    TotalPrice: number

    @Column()
    BuyingDate: Date

    @Column()
    discountedPrice: number

    @Column({nullable:true})
    Coupon: string

    @Column({nullable:true})
    Payment: string

    @Column()
    PaymentDone: string

    @ManyToOne(() => CustomerEntity, (customer) => customer.buyingHistories)
    customer: CustomerEntity

    @ManyToOne(() => ProductEntity, (product) => product.buyingHistories)
    product: ProductEntity

    @ManyToOne(() => DeliveryStatusEntity, (deliveryStatus) => deliveryStatus.buyingHistories)
    deliveryStatus: DeliveryStatusEntity
}
