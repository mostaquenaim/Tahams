/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('product-pictures')
export class ProductPictureEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    filename: string

    @Column({ default: false })
    isThumbnail: boolean

    @Column({ default: false })
    isFeatured: boolean

    // @ManyToOne(() => ColorEntity, (color) => color.productPictures)
    // color: ColorEntity

    @ManyToOne(() => ProductEntity, (product) => product.productPictures)
    product: ProductEntity;

}
