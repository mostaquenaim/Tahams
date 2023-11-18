/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { ProductEntity } from './product.entity';
import { CategoryEntity } from './category.entity';
import { SubCategoryEntity } from './subCategory.entity';

@Entity('sub-sub-category')
export class SubSubCategoryEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    categoryName: string;

    @Column({ nullable: true })
    filename: string;

    @ManyToMany(() => ProductEntity, (product) => product.subCategories)
    products: ProductEntity[]

    @ManyToOne(() => SubCategoryEntity, (category) => category.subSubs)
    category: SubCategoryEntity

}
