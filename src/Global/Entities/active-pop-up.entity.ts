/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { PopUpEntity } from './pop-up.entity';

@Entity('active_pop_up')
export class ActivePopUpEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => PopUpEntity, (popup) => popup.active_pops)
    popup: PopUpEntity
}
