/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';
import { ColorEntity } from './colors.entity';
import { ColorSizeEntity } from './color-size-combined.entity';
import { ProductSizeCategoryEntity } from './productSizeCategory.entity';

@Entity('size')
export class SizeEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @OneToMany(()=>ColorSizeEntity,(colorsize)=>colorsize.size)
    colorsize: ColorSizeEntity[]

    @OneToMany(() => ProductSizeCategoryEntity, (psc) => psc.size)
    pscs: ProductSizeCategoryEntity[]
}
