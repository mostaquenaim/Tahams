import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';

@Entity('banner')
export class BannerEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    filename: string

}
