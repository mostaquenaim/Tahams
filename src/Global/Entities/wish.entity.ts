/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, ManyToOne} from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('wish-list')
export class WishEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProductEntity, (product) => product.wishes)
    product: ProductEntity
}
