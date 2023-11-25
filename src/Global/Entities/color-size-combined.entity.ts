/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { ProductEntity } from './product.entity';
import { ProductPictureEntity } from './product-pictures.entity';
import { SizeEntity } from './size.entity';
import { ColorEntity } from './colors.entity';

@Entity('colors-size')
export class ColorSizeEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({default:1})
    quantity: number

    @Column()
    size: string

    @ManyToOne(() => ColorEntity, (color) => color.colorsize)
    color: ColorEntity
}
