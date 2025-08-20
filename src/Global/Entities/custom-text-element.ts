import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CustomizationRequestEntity } from './customization-request.entity';

@Entity('custom_text_element')
export class CustomTextElement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({ nullable: true })
  height: number;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  x: number;

  @Column({ nullable: true })
  y: number;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  fontFamily: string;

  @Column({ nullable: true })
  fontSize: number;

  @Column({ nullable: true })
  fontWeight: string;

  @Column({ nullable: true })
  rotation: number;

  @ManyToOne(
    () => CustomizationRequestEntity,
    (customReq) => customReq.customTexts,
  )
  customReq: CustomizationRequestEntity;
}
