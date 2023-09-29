import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeForm } from '../DTOs/employeeform.dto';
import { Repository } from 'typeorm';
import { EmployeeEntity } from '../Entities/employee.entity';

@Injectable()
export class EmployeeService {

  constructor(
    @InjectRepository(EmployeeEntity)
    private userRepository: Repository<EmployeeEntity>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  getName(): string {
    return 'my name is khan'
  }

  createUser(createUserDto: EmployeeForm) {
    console.log(createUserDto)
    // Logic to create a user using the provided data
    return createUserDto;
  }
}
