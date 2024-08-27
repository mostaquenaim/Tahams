/* eslint-disable prettier/prettier */
import { CartsEntity } from 'src/Global/Entities/cart.entity';
import { WishEntity } from 'src/Global/Entities/wish.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({nullable:true})
    uniqueId: string;

    @Column()
    password: string;

    @Column({ unique: true })
    email: string;

    @Column({ default: 'customer' })
    role: string;

    @Column({ nullable: true })
    mbl_no: string;

    @Column({ nullable: true })
    filename: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    region: string;

    @Column({ nullable: true })
    state: string;

    @Column({ nullable: true })
    postal_code: string;

    @Column({ nullable: true })
    date_of_birth: Date;

    @Column({ nullable: true })
    gender: string;

    @Column({ nullable: true })
    loggedInWith: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    // relationships 
    // relationships 
    // relationships 
    @OneToMany(() => CartsEntity, (cart) => cart.customer)
    carts: CartsEntity[];

    @OneToMany(() => WishEntity, (wish) => wish.customer)
    wishes: WishEntity[];
}
