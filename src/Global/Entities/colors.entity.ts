/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('colors')
export class ColorEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    colorCode: string;

    // @Column({default:1})
    // quantity: number;

    // @ManyToOne(() => ProductEntity, (product) => product.colors)
    // product: ProductEntity

    @OneToMany(() => ProductEntity, (product) => product.color)
    products: ProductEntity[]

    // @OneToMany(() => ColorSizeEntity, (colorsize) => colorsize.color)
    // colorsize: ColorSizeEntity[]

}
