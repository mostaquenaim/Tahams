/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProductEntity } from './product.entity';
import { ProductPictureEntity } from './product-pictures.entity';

@Entity('colors')
export class ColorEntity {

    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column()
    colorCode: string;

    @ManyToOne(() => ProductEntity, (product) => product.colors)
    product: ProductEntity

    @OneToMany(() => ProductPictureEntity, (productPicture) => productPicture.color)
    productPictures: ProductPictureEntity[]

    // @OneToMany(() => BuyingHistoryEntity, (buyingHistory) => buyingHistory.color)
    // buyingHistories: BuyingHistoryEntity[]

}
