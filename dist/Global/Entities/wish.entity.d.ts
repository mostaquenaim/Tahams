import { ProductEntity } from './product.entity';
import { CustomerEntity } from 'src/Customer/Entities/customer.entity';
export declare class WishEntity {
    id: number;
    product: ProductEntity;
    customer: CustomerEntity;
}
