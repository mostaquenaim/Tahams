import { CartsEntity } from './cart.entity';
export declare class CouponEntity {
    id: number;
    name: string;
    discountPercentage: number;
    discountMoney: number;
    limitAmount: number;
    minimumSpent: number;
    isEnable: boolean;
    carts: CartsEntity[];
}
