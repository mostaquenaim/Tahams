/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('size')
export class SizeEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    size: string

    @ManyToMany(() => ProductEntity, (product) => product.sizes)
    products: ProductEntity[]
}
