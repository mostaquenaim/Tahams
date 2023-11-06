/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ColorEntity } from './colors.entity';

@Entity('product-pictures')
export class ProductPictureEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    filename: string

    @Column()
    isThumbnail : boolean

    @ManyToOne(() => ColorEntity, (color) => color.productPictures)
    color: ColorEntity
}
