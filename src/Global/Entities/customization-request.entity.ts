import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { CustomTextElement } from './custom-text-element';
import { CustomImgElement } from './custom-img-element';

@Entity('customization_requests')
export class CustomizationRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  color: string;

  @Column({ nullable: true })
  previewImage: string;

  @CreateDateColumn({ nullable: true })
  timestamp: Date;

  @OneToMany(() => CustomTextElement, (customText) => customText.customReq)
  customTexts: CustomTextElement[]

  @OneToMany(() => CustomImgElement, (customImg) => customImg.customReq)
  customImages: CustomImgElement[]
}
