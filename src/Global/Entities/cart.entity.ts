/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne} from 'typeorm';
import { CustomerEntity } from 'src/Customer/Entities/customer.entity';
import { ProductEntity } from './product.entity';
import { BuyingHistoryEntity } from './buyingHistory.entity';
import { CouponEntity } from './coupon.entity';

@Entity('carts')
export class CartsEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    Quantity: number

    @Column()
    ProductName: string

    @Column()
    UnitPrice: number

    @Column()
    TotalPrice: number

    @Column()
    BuyingDate: Date

    @Column()
    discountedPrice: number

    @ManyToOne(() => CustomerEntity, (customer) => customer.carts)
    customer: CustomerEntity

    @ManyToOne(() => ProductEntity, (product) => product.carts)
    product: ProductEntity

    @ManyToOne(() => CouponEntity, (coupon) => coupon.carts, { nullable: true })
    coupon: CouponEntity

    @ManyToOne(() => BuyingHistoryEntity, (history) => history.carts, { nullable: true })
    history: BuyingHistoryEntity
}
