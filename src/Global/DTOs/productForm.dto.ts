/* eslint-disable prettier/prettier */
import { IsNotEmpty } from 'class-validator';

export default class ProductForm {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    serialNo: string

    @IsNotEmpty()
    buyingPrice: string

    @IsNotEmpty()
    sellingPrice: string

    @IsNotEmpty()
    description: string
}
