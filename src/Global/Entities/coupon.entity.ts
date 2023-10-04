/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { CartsEntity } from './cart.entity';

@Entity('coupons')
export class CouponEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column({nullable:true})
    discountPercentage: string

    @Column({nullable:true})
    discountMoney: string

    @Column({nullable:true})
    limitAmount: string

    @Column()
    minimumSpent: string

    @Column()
    isEnable: boolean

    @OneToMany(() => CartsEntity, (cart) => cart.coupon)
    carts: CartsEntity[]
}
