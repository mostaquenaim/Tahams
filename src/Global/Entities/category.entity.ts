/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('category')
export class CategoryEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    categoryName: string
    
    @Column({nullable:true})
    filename: string

    @ManyToMany(() => ProductEntity, (product) => product.categories)
    products: ProductEntity[]

}
