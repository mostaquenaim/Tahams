/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { ProductEntity } from './product.entity';
import { ProductPictureEntity } from './product-pictures.entity';
import { SizeEntity } from './size.entity';
import { ColorSizeEntity } from './color-size-combined.entity';

@Entity('colors')
export class ColorEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    colorCode: string;

    @Column({default:1})
    quantity: number;

    @ManyToOne(() => ProductEntity, (product) => product.colors)
    product: ProductEntity

    // @OneToMany(() => ProductPictureEntity, (productPicture) => productPicture.color)
    // productPictures: ProductPictureEntity[]

    @OneToMany(() => ColorSizeEntity, (colorsize) => colorsize.color)
    colorsize: ColorSizeEntity[]

}
