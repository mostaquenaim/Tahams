/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('banner')
export class BannerEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string

    @Column()
    description: string

    @Column()
    filename: string

    @Column()
    isEnable: boolean

    @Column()
    startDate: Date

    @Column()
    endDate: Date

    @Column()
    platform: string
}
