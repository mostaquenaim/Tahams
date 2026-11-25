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
import { Public } from 'src/Rbac/access.decorators';

@Controller('customer')
export class CustomerController {
  constructor(private readonly appService: CustomerService) { }

  @Public()
  @Post('create')
  @UsePipes(new ValidationPipe({ transform: true }))
  createUser(@Body() createUser: CustomerForm) {
    return this.appService.createUser(createUser);
  }

  @Public()
  @Get('/getimage/:name')
  getImages(@Param('name') name, @Res() res) {
    res.sendFile(name, { root: './uploads' });
  }
}
