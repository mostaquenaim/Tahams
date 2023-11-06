/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { SubCategoryEntity } from './subCategory.entity';
import { ColorEntity } from './colors.entity';
import { CartsEntity } from './cart.entity';
import { WishEntity } from './wish.entity';
// import { CouponEntity } from './coupon.entity';

@Entity('product')
export class ProductEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string 

    @Column()
    serialNo: string

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

    @OneToMany(() => CartsEntity, (cart) => cart.product)
    carts: CartsEntity[]

    @OneToMany(() => WishEntity, (wish) => wish.product)
    wishes: WishEntity[]

    @ManyToMany(() => SubCategoryEntity, (subCategory) => subCategory.products)
    @JoinTable()
    subCategories: SubCategoryEntity[]

}
