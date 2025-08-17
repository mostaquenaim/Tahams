import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { CustomTextElement } from './custom-text-element';
import { CustomImgElement } from './custom-img-element';
import { UserEntity } from './user.entity';

export enum RequestStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  REVISIONS_REQUESTED = 'revisions_requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

export enum Side {
  FRONT = 'front',
  BACK = 'back',
  LEFT_SLEEVE = 'left_sleeve',
  RIGHT_SLEEVE = 'right_sleeve',
}

@Entity('customization_requests')
export class CustomizationRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  color: string;

  @Column({ type: 'enum', enum: Side, default: Side.FRONT })
  side: Side;

  @Column({
    default: false,
  })
  isChecked: boolean;

  @Column({ nullable: true })
  previewImage: string;
  
  @Column({ type: 'int', nullable: true })
  quantity: number;

  @Column({ nullable: true })
  size: string;

  @Column({ nullable: true })
  printingMethod?: string; 

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.DRAFT })
  status: RequestStatus;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  rejectedAt?: Date;

  @Column({ nullable: true })
  reviewerNote?: string;

  @Column({ nullable: true })
  rejectionReason?: string;

  @Column({ nullable: true })
  specialInstructions: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone: string;

  // relations
  // relations
  // relations

  @ManyToOne(() => UserEntity, (user) => user.customReqs)
  user: UserEntity;

  @OneToMany(() => CustomTextElement, (customText) => customText.customReq)
  customTexts: CustomTextElement[];

  @OneToMany(() => CustomImgElement, (customImg) => customImg.customReq)
  customImages: CustomImgElement[];
}
