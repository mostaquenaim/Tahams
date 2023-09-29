/* eslint-disable prettier/prettier */
import { BuyingHistoryEntity } from 'src/Global/Entities/buyingHistory.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('employee')
export class EmployeeEntity {


    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column()
    password: string

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    mbl_no: string
    
    @Column({ nullable: true })
    filename: string

    @OneToMany(() => BuyingHistoryEntity, (buyingHistory) => buyingHistory.customer)
    buyingHistories: BuyingHistoryEntity[]

}
