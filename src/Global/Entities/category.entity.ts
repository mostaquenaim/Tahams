/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { SubCategoryEntity } from './subCategory.entity';
import { BannerEntity } from './banner.entity';

@Entity('category')
export class CategoryEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column({ nullable: true })
    filename: string

    @Column({ default: false })
    isGenderVaried: boolean

    @Column({ default: true })
    isForMen: boolean

    @Column({ default: true })
    isForWomen: boolean

    @OneToMany(() => SubCategoryEntity, (sub) => sub.category)
    subs: SubCategoryEntity[]

    @OneToMany(() => BannerEntity, (banner) => banner.category)
    banners: BannerEntity[]
}
