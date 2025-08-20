import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CustomizationRequestEntity } from './customization-request.entity';

@Entity('custom_img_element')
export class CustomImgElement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column({ nullable: true })
  height: number;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  x: number;

  @Column({ nullable: true })
  y: number;

  @Column({ nullable: true })
  rotation: number;

  @Column({ nullable: true })
  originalHeight: number;

  @Column({ nullable: true })
  originalWidth: number;

  @ManyToOne(
    () => CustomizationRequestEntity,
    (customReq) => customReq.customImages,
  )
  customReq: CustomizationRequestEntity;
}
