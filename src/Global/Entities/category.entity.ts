import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, OneToMany } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('category')
export class CategoryEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    categoryName: string

    @OneToMany(()=> ProductEntity,(product)=>product.category)
    products:ProductEntity[]

}
