/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { SubSubCategoryEntity } from './subSubCategory.entity';

@Entity('gender')
export class GenderEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string
    
    @OneToMany(() => SubSubCategoryEntity, (subSubs) => subSubs.gender)
    subSubs: SubSubCategoryEntity
}
