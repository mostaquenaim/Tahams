/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { ProductEntity } from './product.entity';
import { UserEntity } from './user.entity';

@Entity('view_product')
export class ViewProductEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProductEntity, (product) => product.view)
    product: ProductEntity

    @ManyToOne(() => UserEntity, (user) => user.view)
    user: UserEntity

    @Column()
    times: number
}
