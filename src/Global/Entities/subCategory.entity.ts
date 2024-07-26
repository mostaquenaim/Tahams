/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { ProductEntity } from './product.entity';
import { CategoryEntity } from './category.entity';
import { SubSubCategoryEntity } from './subSubCategory.entity';

@Entity('sub-category')
export class SubCategoryEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    filename: string;

    @ManyToOne(() => CategoryEntity, (category) => category.subs)
    category: CategoryEntity

    @OneToMany(() => SubSubCategoryEntity, (subSubs) => subSubs.category)
    subSubs: SubSubCategoryEntity
}
