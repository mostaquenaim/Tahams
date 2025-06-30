/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { ProductEntity } from './product.entity';
import { CategoryEntity } from './category.entity';
import { SubCategoryEntity } from './subCategory.entity';
import { ProductSizeCategoryEntity } from './productSizeCategory.entity';
import { CartsEntity } from './cart.entity';
import { GenderEntity } from './gender.entity';
import { NewArrivalEntity } from './new-arrival.entity';

@Entity('sub-sub-category')
export class SubSubCategoryEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    filename: string;

    @Column({ default: false })
    isEnablePremium: boolean

    @Column({ default: false })
    isPremium: boolean

    @Column({ default: false })
    isRegular: boolean

    @Column({ default: false })
    isDisabled: boolean

    @ManyToOne(() => GenderEntity, (gender) => gender.subSubs)
    gender: GenderEntity

    @ManyToOne(() => SubCategoryEntity, (category) => category.subSubs)
    category: SubCategoryEntity

    @OneToMany(() => ProductSizeCategoryEntity, (psc) => psc.category)
    pscs: ProductSizeCategoryEntity[]

    @OneToMany(() => CartsEntity, (cart) => cart.category)
    carts: CartsEntity[]

    @OneToMany(() => NewArrivalEntity, (arrive) => arrive.subsub)
    arrivals: NewArrivalEntity[]
}
