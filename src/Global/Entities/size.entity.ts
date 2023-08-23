import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, ManyToOne } from 'typeorm';

@Entity('size')
export class SizeEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    size: string

}
