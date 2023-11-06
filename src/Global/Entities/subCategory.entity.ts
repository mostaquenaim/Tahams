/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne } from 'typeorm';
import { ProductEntity } from './product.entity';
import { CategoryEntity } from './category.entity';

@Entity('sub-category')
export class SubCategoryEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    categoryName: string;

    @Column({ nullable: true })
    filename: string;

    @ManyToMany(() => ProductEntity, (product) => product.subCategories)
    products: ProductEntity[]

    @ManyToOne(() => CategoryEntity, (category) => category.subs)
    category: CategoryEntity


}
