// blacklist-token.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class BlacklistToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  jti: string;  // JWT ID
  
  @Column()
  expiry: number; // Expiry timestamp
}
