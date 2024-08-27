/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { ProductEntity } from './product.entity';
import { CategoryEntity } from './category.entity';
import { SubCategoryEntity } from './subCategory.entity';
import { ProductSizeCategoryEntity } from './productSizeCategory.entity';
import { CartsEntity } from './cart.entity';

@Entity('sub-sub-category')
export class SubSubCategoryEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    filename: string;

    @ManyToOne(() => SubCategoryEntity, (category) => category.subSubs)
    category: SubCategoryEntity

    @OneToMany(() => ProductSizeCategoryEntity, (psc) => psc.category)
    pscs: ProductSizeCategoryEntity[]

    @OneToMany(() => CartsEntity, (cart) => cart.category)
    carts: CartsEntity[]
}
