/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { PopUpEntity } from './pop-up.entity';
import { CustomerActivityEntity } from './customer-activity.entity';

@Entity('activity')
export class ActivityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({})
  name: string;

  @OneToMany(
    () => CustomerActivityEntity,
    (customerActivity) => customerActivity.activity,
  )
  customerActivities: CustomerActivityEntity[];

  //   @ManyToOne(
  //     () => DeliveryStatusEntity,
  //     (deliveryStatus) => deliveryStatus.buyingHistories,
  //   )
  //   deliveryStatus: DeliveryStatusEntity;

  //   @ManyToOne(
  //     () => PaymentMethodEntity,
  //     (paymentMethod) => paymentMethod.buyingHistories,
  //   )
  //   paymentMethod: PaymentMethodEntity;

  //   @OneToMany(() => CartsEntity, (cart) => cart.history)
  //   carts: CartsEntity[];

  //   @OneToOne(() => CourierInfo)
  //   @JoinColumn()
  //   courierInfo: CourierInfo;
}
