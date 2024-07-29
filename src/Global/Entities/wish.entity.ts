/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, ManyToOne} from 'typeorm';
import { ProductEntity } from './product.entity';
import { UserEntity } from './user.entity';

@Entity('wish-list')
export class WishEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProductEntity, (product) => product.wishes)
    product: ProductEntity

    @ManyToOne(() => UserEntity, (customer) => customer.wishes)
    customer: UserEntity
}
