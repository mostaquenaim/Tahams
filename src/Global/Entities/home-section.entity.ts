/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// A product row shown on the storefront home page. Admins choose the title
// and the (ordered) products; `productIds` is a plain id list rather than a
// relation so ordering is explicit and deleted products just drop out.
@Entity('home-section')
export class HomeSectionEntity {
    @PrimaryGeneratedColumn()
    id: number;

    // Small line above the title, e.g. "ZIPPER".
    @Column({ nullable: true })
    eyebrow: string

    @Column()
    title: string

    // Display order, 0-based.
    @Column({ default: 0 })
    position: number

    @Column({ default: true })
    isActive: boolean

    @Column('int', { array: true, default: () => "'{}'" })
    productIds: number[]
}
