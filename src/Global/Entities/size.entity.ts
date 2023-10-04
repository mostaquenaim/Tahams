/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { ColorEntity } from './colors.entity';

@Entity('size')
export class SizeEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    size: string

    @ManyToMany(() => ColorEntity, (color) => color.sizes)
    colors: ColorEntity[]
}
