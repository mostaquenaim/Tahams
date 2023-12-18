/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { ColorEntity } from './colors.entity';
import { CartsEntity } from './cart.entity';
import { WishEntity } from './wish.entity';
import { SubSubCategoryEntity } from './subSubCategory.entity';
import { ProductPictureEntity } from './product-pictures.entity';
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

    @Column({default:0})
    vatPercentage: number

    @Column({default:0})
    discountPercentage: number

    @Column({default:0})
    buyingPrice: number

    @Column({default:0})
    sellingPrice: number

    @Column({ nullable: true })
    tags: string

    @Column()
    description: string

    @Column({default:true})
    ifStock: boolean

    @Column({nullable:true})
    filename: string

    @ManyToMany(() => SubSubCategoryEntity, (subCategory) => subCategory.products)
    @JoinTable()
    subCategories: SubSubCategoryEntity[]

    // @OneToMany(() => ColorEntity, (color) => color.product)
    // colors: ColorEntity[]

    @ManyToOne(() => ColorEntity, (color) => color.products)
    color: ColorEntity

    @OneToMany(() => ProductPictureEntity, (productPicture) => productPicture.product)
    productPictures: ProductPictureEntity[]

    @OneToMany(() => CartsEntity, (cart) => cart.product)
    carts: CartsEntity[]

    @OneToMany(() => WishEntity, (wish) => wish.product)
    wishes: WishEntity[]

}
