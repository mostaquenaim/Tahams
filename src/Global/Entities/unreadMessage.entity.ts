/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('unread_message')
export class UnreadMessageEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 0 })
    quantity: number

    @ManyToOne(() => UserEntity, (user) => user.msgcnt)
    user: UserEntity
}
