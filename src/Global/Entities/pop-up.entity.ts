/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ActivePopUpEntity } from './active-pop-up.entity';

@Entity('pop_up')
export class PopUpEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    filename: string;

    @Column({ unique: true })
    title: string;

    @Column({ nullable: true })
    url: string; // for clicking the pop-up and going somewhere

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'timestamp', nullable: true })
    startDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    endDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => ActivePopUpEntity, (active_pop) => active_pop.popup)
    active_pops: ActivePopUpEntity[]
}
