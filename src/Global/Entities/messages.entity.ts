/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('message')
export class MessageEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string

    @Column({ default: false })
    isUrgent: boolean

    @Column({ default: false })
    isRead: boolean

    @ManyToOne(() => UserEntity, (sender) => sender.msgss)
    sender: UserEntity

    @ManyToOne(() => UserEntity, (receiver) => receiver.msgsr)
    receiver: UserEntity
}
