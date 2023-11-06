/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import CustomerForm from '../DTOs/customerform.dto';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../Entities/customer.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerService {

  constructor(
    @InjectRepository(CustomerEntity)
    private userRepository: Repository<CustomerEntity>,
  ) {}

  async createUser(myDto : CustomerForm) {
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(myDto.password, salt);
    myDto.password = hashedPass;
    return this.userRepository.save(myDto);
  }
}
