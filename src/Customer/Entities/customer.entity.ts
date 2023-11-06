/* eslint-disable prettier/prettier */
import { CartsEntity } from 'src/Global/Entities/cart.entity';
import { WishEntity } from 'src/Global/Entities/wish.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer')
export class CustomerEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    mbl_no: string;

    @Column({ nullable: true })
    filename: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    state: string;

    @Column({ nullable: true })
    postal_code: string;

    @Column({ nullable: true })
    date_of_birth: Date;

    @Column({ nullable: true })
    gender: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    // relationships 
    @OneToMany(() => CartsEntity, (cart) => cart.customer)
    carts: CartsEntity[];

    @OneToMany(() => WishEntity, (wish) => wish.customer)
    wishes: WishEntity[];
}
