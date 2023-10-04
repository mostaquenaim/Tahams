/* eslint-disable prettier/prettier */
import { CartsEntity } from 'src/Global/Entities/cart.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer')
export class CustomerEntity {


    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column()
    password: string

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    mbl_no: string
    
    @Column({ nullable: true })
    filename: string

    @OneToMany(() => CartsEntity, (cart) => cart.customer)
    carts: CartsEntity[]

}
