/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { CategoryEntity } from './category.entity';
import { SizeAndProductEntity } from './sizeAndProduct.entity';

@Entity('product')
export class ProductEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column({ nullable: true })
    tags: string

    

    @Column()
    description: string

    @Column()
    ifStock: string

    @Column()
    price: string

    @Column({ nullable: true })
    availableSizes: string

    @Column({ nullable: true })
    filename: string

    @OneToMany(()=> SizeAndProductEntity,(sizeAndProduct)=>sizeAndProduct.product)
    sizeAndProducts:SizeAndProductEntity[]



}
