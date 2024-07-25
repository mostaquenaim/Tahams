/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { ColorEntity } from './colors.entity';
import { ColorSizeEntity } from './color-size-combined.entity';
import { ProductEntity } from './product.entity';
import { SizeEntity } from './size.entity';
import { SubSubCategoryEntity } from './subSubCategory.entity';

@Entity('product_size_category')
export class ProductSizeCategoryEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProductEntity, (product) => product.pscs)
    product: ProductEntity

    @ManyToOne(() => SubSubCategoryEntity, (category) => category.pscs)
    category: SubSubCategoryEntity

    @ManyToOne(() => SizeEntity, (size) => size.pscs)
    size: SizeEntity

    @Column({default: 0})
    quantity: number

    // @OneToMany(() => ProductPictureEntity, (productPicture) => productPicture.product)
    // productPictures: ProductPictureEntity[]


}
