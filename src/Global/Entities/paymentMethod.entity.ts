/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BuyingHistoryEntity } from './buyingHistory.entity';

// Orders keep a link to their payment method, so rows are never deleted -
// switch one off with isActive instead.
//
// Every column below `name` is nullable or has a default: the live database
// runs with synchronize: true, and that keeps the change to "ADD COLUMN".
@Entity('payment-method')
export class PaymentMethodEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    // How to pay, shown to the customer (line breaks are kept).
    @Column({ type: 'text', nullable: true })
    instructions: string | null

    // The number the customer sends money to; offered as a "Copy" button.
    // Must also appear in `instructions` (checked on save).
    @Column({ type: 'varchar', length: 30, nullable: true })
    accountNumber: string | null

    // Path of an image in the storefront's public folder, e.g. /bkash-bnw.png
    @Column({ type: 'varchar', length: 120, nullable: true })
    icon: string | null

    // Offered on the "pay online now" page (customer sends money and uploads
    // a screenshot). Never true for cash on delivery / pay at pickup.
    @Column({ default: false })
    payOnline: boolean

    // Inactive methods are hidden from customers and refused at payment.
    @Column({ default: true })
    isActive: boolean

    // Lower first. New and unknown methods default to the end of the list.
    @Column({ type: 'int', default: 100 })
    sortOrder: number

    // Set once the row has its checkout details (by the one-time fill on
    // startup, or by an admin). The fill never touches a row that has it.
    @Column({ type: 'timestamptz', nullable: true })
    configuredAt: Date | null

    @OneToMany(() => BuyingHistoryEntity, (buyingHistory) => buyingHistory.paymentMethod)
    buyingHistories: BuyingHistoryEntity[]

}
