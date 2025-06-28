/* eslint-disable prettier/prettier */
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
import { ColorEntity } from './colors.entity';
import { CartsEntity } from './cart.entity';
import { WishEntity } from './wish.entity';
import { ProductPictureEntity } from './product-pictures.entity';
import { ProductSizeCategoryEntity } from './productSizeCategory.entity';
import { FabricEntity } from './fabrics.entity';
import { ViewProductEntity } from './viewProduct.entity';
import { NewArrivalEntity } from './new-arrival.entity';
// import { CouponEntity } from './coupon.entity';

@Entity('product')
export class ProductEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column()
    serialNo: string

    @Column({ nullable: true })
    note: string

    @Column({ nullable: true })
    purchaseDate: Date

    @Column({ default: 0 })
    vatPercentage: number

    @Column({ default: 0 })
    discountPercentage: number

    @Column({ default: 0 })
    buyingPrice: number

    @Column({ default: 0 })
    sellingPrice: number

    @Column({ nullable: true })
    tags: string

    @Column()
    description: string

    @Column({ nullable: true })
    longDescription: string

    @Column({ default: true })
    ifStock: boolean

    @Column({ nullable: true })
    filename: string

    @Column({ default: false })
    publishable: boolean

    @Column({ default: 0 })
    totalViews: number

    @Column({ default: 0 })
    salesCount: number

    // Timestamp columns
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updateAt: Date;


    // relations 
    // relations 
    // relations 
    @ManyToOne(() => ColorEntity, (color) => color.products)
    color: ColorEntity

    @ManyToOne(() => FabricEntity, (fabric) => fabric.products)
    fabric: FabricEntity

    @OneToMany(() => ProductPictureEntity, (productPicture) => productPicture.product)
    productPictures: ProductPictureEntity[]

    @OneToMany(() => ProductSizeCategoryEntity, (psc) => psc.product)
    pscs: ProductSizeCategoryEntity[]

    @OneToMany(() => CartsEntity, (cart) => cart.product)
    carts: CartsEntity[]

    @OneToMany(() => WishEntity, (wish) => wish.product)
    wishes: WishEntity[]

    @OneToMany(() => ViewProductEntity, (view) => view.product)
    views: ViewProductEntity[]

    // @OneToMany(() => NewArrivalEntity, (arrive) => arrive.product)
    // arrivals: NewArrivalEntity[]

}
