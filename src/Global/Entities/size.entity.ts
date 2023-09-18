/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { SizeAndProductEntity } from './sizeAndProduct.entity';

@Entity('size')
export class SizeEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    size: string

    @OneToMany(()=> SizeAndProductEntity,(sizeAndProduct)=>sizeAndProduct.size)
    sizeAndProducts:SizeAndProductEntity[]

}
