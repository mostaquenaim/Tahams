import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerForm } from '../DTOs/customerform.dto';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../Entities/customer.entity';

@Injectable()
export class CustomerService {

  constructor(@InjectRepository(CustomerEntity) private userRepository: Repository<CustomerEntity>) {}

  getHello(): string {
    return 'Hello World!';
  }

  getName(): string {
    return 'my name is khan'
  }

  createUser(createUserDto: CustomerForm) {
    console.log(createUserDto)
    // Logic to create a user using the provided data
    return createUserDto;
  }
}
