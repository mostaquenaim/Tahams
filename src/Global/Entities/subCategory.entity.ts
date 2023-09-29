/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { ProductEntity } from './product.entity';

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

}
