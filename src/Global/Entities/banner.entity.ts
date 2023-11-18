/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { CategoryEntity } from './category.entity';

@Entity('banner')
export class BannerEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable:true})
    title: string

    @Column({nullable:true})
    description: string

    @Column()
    filename: string

    @Column({default:true})
    isEnable: boolean

    @Column()
    startDate: Date

    @Column()
    endDate: Date

    @Column({nullable:true})
    platform: string

    @ManyToOne(() => CategoryEntity, (category) => category.subs, { nullable: true })
    category: CategoryEntity | null;

}
