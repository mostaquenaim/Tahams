/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, Matches, IsOptional } from 'class-validator';

export default class CouponForm {

    @IsNotEmpty()
    name: string;


}
