import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';

@Entity('customer')
export class CustomerEntity {


    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column({ nullable: true })
    uname: string

    @Column()
    password: string

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    mbl_no: string
    
    @Column({ nullable: true })
    filename: string



}
