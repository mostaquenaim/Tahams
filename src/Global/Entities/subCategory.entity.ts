import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, OneToMany } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('sub-category')
export class SubCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  categoryName: string;
    
  @Column({ nullable: true })
  filename: string;

  
}
