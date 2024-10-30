/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany, ManyToOne } from 'typeorm';
import { CartsEntity } from './cart.entity';

@Entity('returnORcancel')
export class ReturnEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    quantity: number;

    @Column({ default: false })
    isApproved: boolean

    @Column({ nullable: true })
    reason: string

    @ManyToOne(() => CartsEntity, (cart) => cart.returns)
    cart: CartsEntity
}
