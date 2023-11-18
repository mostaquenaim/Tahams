/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import CustomerForm from '../DTOs/customerform.dto';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../Entities/customer.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CustomerService {

  constructor(
    @InjectRepository(CustomerEntity)
    private userRepository: Repository<CustomerEntity>,
  ) { }

  async createUser(myDto: CustomerForm) {
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(myDto.password, salt);
    myDto.password = hashedPass;

    // Generate a unique ID using UUID (you can use any other method)
    myDto.uniqueId = uuidv4();

    return this.userRepository.save(myDto);
  }

}
