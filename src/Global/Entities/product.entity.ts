import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { CategoryEntity } from './category.entity';
import { SizeEntity } from './size.entity';

@Entity('products')
export class ProductEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column({ nullable: true })
    tags: string

    @Column()
    description: string

    @Column()
    ifStock: string

    @Column()
    price: string

    @Column({ nullable: true })
    filename: string

    @ManyToOne(()=> CategoryEntity,(category)=>category.products)
    category:CategoryEntity

    @ManyToMany(() => SizeEntity)
    @JoinTable()
    sizes: SizeEntity[]

}
