/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CustomerService } from '../Services/customer.service';
import CustomerForm from '../DTOs/customerform.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly appService: CustomerService) { }

  @Post('create')
  @UsePipes(new ValidationPipe({ transform: true }))
  createUser(@Body() createUser: CustomerForm) {
    console.log(createUser);
    return this.appService.createUser(createUser);
  }

  @Get('/getimage/:name')
  getImages(@Param('name') name, @Res() res) {
    res.sendFile(name, { root: './uploads' });
  }
}
