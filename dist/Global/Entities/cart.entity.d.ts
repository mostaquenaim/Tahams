import { UserEntity } from './user.entity';
import { ProductEntity } from './product.entity';
import { BuyingHistoryEntity } from './buyingHistory.entity';
import { CouponEntity } from './coupon.entity';
export declare class CartsEntity {
    id: number;
    uniqueId: string;
    size: string;
    Quantity: number;
    ProductName: string;
    created_at: Date;
    isBought: boolean;
    customer: UserEntity;
    product: ProductEntity;
    coupon: CouponEntity;
    history: BuyingHistoryEntity;
}
