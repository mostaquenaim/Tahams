/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';
import { ColorEntity } from './colors.entity';
import { ColorSizeEntity } from './color-size-combined.entity';

@Entity('size')
export class SizeEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    // @ManyToMany(() => ColorEntity, (color) => color.sizes)
    // colors: ColorEntity[]

    @OneToMany(()=>ColorSizeEntity,(colorsize)=>colorsize.size)
    colorsize: ColorSizeEntity[]
}
