import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('customization_requests')
export class CustomizationRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  color: string;

  // @Column('json')
  // elements: any[];

  @Column({ nullable: true })
  previewImage: string;

  @CreateDateColumn({ nullable: true })
  timestamp: Date;
}
