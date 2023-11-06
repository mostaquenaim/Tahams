/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, ManyToOne} from 'typeorm';
import { ProductEntity } from './product.entity';
import { CustomerEntity } from 'src/Customer/Entities/customer.entity';

@Entity('wish-list')
export class WishEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProductEntity, (product) => product.wishes)
    product: ProductEntity

    @ManyToOne(() => CustomerEntity, (customer) => customer.wishes)
    customer: CustomerEntity
}
