import { UserEntity } from './user.entity';
import { ProductEntity } from './product.entity';
import { BuyingHistoryEntity } from './buyingHistory.entity';
import { CouponEntity } from './coupon.entity';
import { SubSubCategoryEntity } from './subSubCategory.entity';
export declare class CartsEntity {
    id: number;
    uniqueId: string;
    size: string;
    Quantity: number;
    ProductName: string;
    created_at: Date;
    isBought: boolean;
    totalPrice: number;
    category: SubSubCategoryEntity;
    customer: UserEntity;
    product: ProductEntity;
    coupon: CouponEntity;
    history: BuyingHistoryEntity;
}
