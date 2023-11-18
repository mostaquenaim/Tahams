/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { CartsEntity } from './cart.entity';

@Entity('coupons')
export class CouponEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column({ default: 0 })
    discountPercentage: number

    @Column({ default: 0 })
    discountMoney: number

    @Column({ default: 10000 })
    limitAmount: number
 
    @Column({ default: 0 })
    minimumSpent: number

    @Column({ default: true })
    isEnable: boolean;

    @OneToMany(() => CartsEntity, (cart) => cart.coupon)
    carts: CartsEntity[]
}
