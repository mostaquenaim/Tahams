/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { CategoryEntity } from './category.entity';
import { SizeEntity } from './size.entity';
import { SubCategoryEntity } from './subCategory.entity';
import { BuyingHistoryEntity } from './buyingHistory.entity';
import { ColorEntity } from './colors.entity';

@Entity('product')
export class ProductEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column()
    serialNo: string

    @Column({nullable:true})
    quantity: number

    @Column({nullable:true})
    note: string

    @Column({nullable:true})
    purchaseDate: Date

    @Column({nullable:true})
    vatPercentage: string

    @Column({nullable:true})
    discountPercentage: string

    @Column()
    buyingPrice: string

    @Column()
    sellingPrice: string

    @Column({ nullable: true })
    tags: string

    @Column()
    description: string

    @Column()
    ifStock: string

    @OneToMany(() => ColorEntity, (color) => color.product)
    colors: ColorEntity[]

    @OneToMany(() => BuyingHistoryEntity, (buyingHistory) => buyingHistory.product)
    buyingHistories: BuyingHistoryEntity[]

    @ManyToMany(() => CategoryEntity, (category) => category.products)
    @JoinTable()
    categories: CategoryEntity[]

    @ManyToMany(() => SubCategoryEntity, (subCategory) => subCategory.products)
    @JoinTable()
    subCategories: SubCategoryEntity[]

    @ManyToMany(() => SizeEntity, (size) => size.products)
    @JoinTable()
    sizes: SubCategoryEntity[]
}
