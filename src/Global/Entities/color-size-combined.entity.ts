/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('colors-size')
export class ColorSizeEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({default:1})
    quantity: number

    @Column()
    size: string

    // @ManyToOne(() => ColorEntity, (color) => color.colorsize)
    // color: ColorEntity
}
