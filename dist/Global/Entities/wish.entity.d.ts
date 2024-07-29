import { ProductEntity } from './product.entity';
import { UserEntity } from './user.entity';
export declare class WishEntity {
    id: number;
    product: ProductEntity;
    customer: UserEntity;
}
