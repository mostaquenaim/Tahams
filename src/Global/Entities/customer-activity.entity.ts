/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { PopUpEntity } from './pop-up.entity';
import { ActivityEntity } from './activity.entity';

@Entity('customer_activity')
export class CustomerActivityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  //   @ManyToOne(
  //     () => DeliveryStatusEntity,
  //     (deliveryStatus) => deliveryStatus.buyingHistories,
  //   )
  //   deliveryStatus: DeliveryStatusEntity;

    @ManyToOne(
      () => ActivityEntity,
      (activity) => activity.customerActivities,
    )
    activity: ActivityEntity;

  //   @OneToMany(() => CartsEntity, (cart) => cart.history)
  //   carts: CartsEntity[];

  //   @OneToOne(() => CourierInfo)
  //   @JoinColumn()
  //   courierInfo: CourierInfo;
}
