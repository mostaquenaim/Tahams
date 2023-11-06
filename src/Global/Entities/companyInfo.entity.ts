/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('company-info')
export class CompanyEntity {

    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column()
    termsAndCo: string
    @Column()
    slogan: string
    @Column()
    filename: string
    @Column()
    isDefault: boolean

    // @OneToMany(() => BuyingHistoryEntity, (buyingHistory) => buyingHistory.color)
    // buyingHistories: BuyingHistoryEntity[]

}
