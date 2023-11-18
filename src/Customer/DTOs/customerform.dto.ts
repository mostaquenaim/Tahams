/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, Matches, IsOptional } from 'class-validator';

export default class CustomerForm {

  @Matches(/^[A-Za-z ]+$/, { message: 'Invalid name' })
  name: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsNotEmpty({ message: 'Unique Id is required' })
  uniqueId: string

  @IsOptional()
  @Matches(/^01[356789][0-9]{8}$/, { message: 'Phone number must be valid' })
  mbl_no: string | null;
}
