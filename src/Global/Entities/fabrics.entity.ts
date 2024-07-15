/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('fabric')
export class FabricEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fabricName: string;

    @OneToMany(() => ProductEntity, (product) => product.color)
    products: ProductEntity[]

}
