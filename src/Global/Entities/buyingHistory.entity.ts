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
import { CourierInfo } from './courier-info.entity';

@Entity('buying-history')
export class BuyingHistoryEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  isDraft: boolean

  @Column({ nullable: true })
  fullName: string

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

  @Column({ nullable: true })
  receivedDate: Date

  @Column({ nullable: true })
  processedDate: Date

  @Column({ nullable: true })
  readyToShipDate: Date

  @Column({ nullable: true })
  droppedOffDate: Date

  @Column({ nullable: true })
  outDate: Date

  @Column({ nullable: true })
  deliveredDate: Date

  @Column({ nullable: true })
  cancelDate: Date

  @Column({ nullable: true })
  returnDate: Date

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  checkedDate: Date

  @Column({ nullable: true })
  PaymentDetails: string

  @Column({ default: false })
  isChecked: boolean

  @Column({ nullable: true })
  screenshot: string //payment screenshot

  @Column({ default: false })
  PaymentDone: boolean

  @Column({ nullable: true })
  facebookProfile: string

  @Column({ nullable: true, type: 'text' })
  notes: string

  @Column({ default: false })
  isPickup: boolean

  @Column({ nullable: true })
  pickupCenter: string

  @Column({ length: 250, default: 'Order created.', nullable: true })
  adminNote: string

  @ManyToOne(() => DeliveryStatusEntity, (deliveryStatus) => deliveryStatus.buyingHistories)
  deliveryStatus: DeliveryStatusEntity

  @ManyToOne(() => PaymentMethodEntity, (paymentMethod) => paymentMethod.buyingHistories)
  paymentMethod: PaymentMethodEntity

  @OneToMany(() => CartsEntity, (cart) => cart.history)
  carts: CartsEntity[]

  @OneToOne(() => CourierInfo)
  @JoinColumn()
  courierInfo: CourierInfo;
}
