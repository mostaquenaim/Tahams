/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne} from 'typeorm';
import { UserEntity } from './user.entity';
import { ProductEntity } from './product.entity';
import { BuyingHistoryEntity } from './buyingHistory.entity';
import { CouponEntity } from './coupon.entity';
import { SubSubCategoryEntity } from './subSubCategory.entity';

@Entity('cart')
export class CartsEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable:true})
    uniqueId: string

    @Column({nullable:true})
    size: string

    @Column()
    Quantity: number

    @Column()
    ProductName: string
    
    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({default:false})
    isBought: boolean

    @Column({default:0})
    totalPrice: number

    @ManyToOne(() => SubSubCategoryEntity, (category) => category.carts)
    category: SubSubCategoryEntity

    @ManyToOne(() => UserEntity, (customer) => customer.carts)
    customer: UserEntity

    @ManyToOne(() => ProductEntity, (product) => product.carts)
    product: ProductEntity

    @ManyToOne(() => CouponEntity, (coupon) => coupon.carts, { nullable: true })
    coupon: CouponEntity

    @ManyToOne(() => BuyingHistoryEntity, (history) => history.carts, { nullable: true })
    history: BuyingHistoryEntity
}
