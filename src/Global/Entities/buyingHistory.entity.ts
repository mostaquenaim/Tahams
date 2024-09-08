/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { DeliveryStatusEntity } from './deliveryStatus.entity';
import { CartsEntity } from './cart.entity';
import { PaymentMethodEntity } from './paymentMethod.entity';
import { PaymentInfo } from './paymentInfo.entity';

@Entity('buying-history')
export class BuyingHistoryEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    trackingToken: string

    @Column()
    address: string

    @Column()
    region: string

    @Column()
    city: string

    @Column()
    phone_no: string

    @Column()
    deliveryFee: number

    @Column()
    BuyingDate: Date

    @Column({nullable: true})
    receivedDate: Date

    @Column({nullable: true})
    processedDate: Date

    @Column({nullable: true})
    readyToShipDate: Date

    @Column({nullable: true})
    droppedOffDate: Date

    @Column({nullable: true})
    outDate: Date

    @Column({nullable: true})
    deliveredDate: Date

    @Column({nullable: true})
    cancelDate: Date

    @Column({nullable: true})
    returnDate: Date

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    checkedDate: Date

    @Column({nullable:true})
    PaymentDetails: string

    @Column({default:false})
    isChecked: boolean

    @Column({nullable:true})
    screenshot: string //payment screenshot

    @Column({default:false})
    PaymentDone: boolean

    @ManyToOne(() => DeliveryStatusEntity, (deliveryStatus) => deliveryStatus.buyingHistories)
    deliveryStatus: DeliveryStatusEntity

    @ManyToOne(() => PaymentMethodEntity, (paymentMethod) => paymentMethod.buyingHistories)
    paymentMethod: PaymentMethodEntity

    @OneToMany(() => CartsEntity, (cart) => cart.history)
    carts: CartsEntity[]

    // @OneToOne(() => PaymentInfo)
    // @JoinColumn()
    // paymentInfo: PaymentInfo

}
