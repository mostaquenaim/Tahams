// dto/create-new-arrival.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNewArrivalDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsNumber()
  @Type(() => Number)
  serial: number;

  @IsNumber()
  @Type(() => Number)
  category: number;

  @IsOptional()
  @IsString()
  filename?: string;
}

// dto/update-new-arrival.dto.ts
export class UpdateNewArrivalDto extends CreateNewArrivalDto {}
