import { CustomerEntity } from 'src/Customer/Entities/customer.entity';
import { ProductEntity } from './product.entity';
import { BuyingHistoryEntity } from './buyingHistory.entity';
import { CouponEntity } from './coupon.entity';
export declare class CartsEntity {
    id: number;
    uniqueId: string;
    Quantity: number;
    ProductName: string;
    created_at: Date;
    isBought: boolean;
    customer: CustomerEntity;
    product: ProductEntity;
    coupon: CouponEntity;
    history: BuyingHistoryEntity;
}
