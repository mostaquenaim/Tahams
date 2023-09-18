import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { SizeEntity } from './size.entity';
import { ProductEntity } from './product.entity';

@Entity('sizeAndProduct')
export class SizeAndProductEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(()=> ProductEntity,(product)=>product.sizeAndProducts)
    product:ProductEntity

    @ManyToOne(()=> SizeEntity,(size)=>size.sizeAndProducts)
    size:SizeEntity

}
