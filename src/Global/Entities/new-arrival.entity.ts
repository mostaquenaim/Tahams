/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ProductEntity } from './product.entity';
import { SubSubCategoryEntity } from './subSubCategory.entity';

@Entity('new-arrival')
export class NewArrivalEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    description: string

    @Column({ nullable: true })
    serial: string

    @Column({ nullable: true })
    category: string

    @Column({ nullable: true })
    name: string

    @Column({ nullable: true })
    filename: string

    // @ManyToOne(() => ProductEntity, (product) => product.arrivals)
    // product: ProductEntity

    @ManyToOne(() => SubSubCategoryEntity, (subsub) => subsub.arrivals)
    subsub: SubSubCategoryEntity
}
