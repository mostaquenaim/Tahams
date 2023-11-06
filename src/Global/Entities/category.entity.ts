/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { SubCategoryEntity } from './subCategory.entity';

@Entity('category')
export class CategoryEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    categoryName: string
    
    @Column({nullable:true})
    filename: string

    @OneToMany(() => SubCategoryEntity, (sub) => sub.category)
    subs: SubCategoryEntity[]
}
