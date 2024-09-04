/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { ProductEntity } from './product.entity';
import { UserEntity } from './user.entity';

@Entity('view_product')
export class ViewProductEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProductEntity, (product) => product.views)
    product: ProductEntity

    @ManyToOne(() => UserEntity, (user) => user.views)
    user: UserEntity

    @Column()
    count: number
}
