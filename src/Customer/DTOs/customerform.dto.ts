import { IsEmail, IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class CustomerForm {

  @Matches(/^[A-Za-z]+$/)
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;


}

