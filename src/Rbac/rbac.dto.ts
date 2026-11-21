import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value);

export class CreateRoleDto {
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  permissions: string[];
}

export class UpdateRoleDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  permissions?: string[];
}

export class PromoteStaffDto {
  @Transform(trim)
  @IsEmail()
  email: string;

  @IsInt()
  @Min(1)
  roleId: number;
}

export class CreateStaffDto {
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @Transform(trim)
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsOptional()
  @Matches(/^01[356789][0-9]{8}$/, { message: 'Phone number must be valid' })
  mbl_no?: string;

  @IsInt()
  @Min(1)
  roleId: number;
}

export class UpdateStaffDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  roleId?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class ResetStaffPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
