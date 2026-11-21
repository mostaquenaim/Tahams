/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import CustomerForm from '../DTOs/customerform.dto';
import { Repository } from 'typeorm';
import { UserEntity } from '../../Global/Entities/user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CustomerService {

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) { }

  // Public registration. Only the whitelisted profile fields are saved: this
  // used to save the whole request body, and the ValidationPipe here doesn't
  // strip unknown properties, so `{"role":"admin", ...}` registered a new
  // ADMIN account (and could set the staff-role columns too).
  async createUser(myDto: CustomerForm) {
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(myDto.password, salt);

    const saved = await this.userRepository.save({
      name: myDto.name,
      email: myDto.email,
      password: hashedPass,
      mbl_no: myDto.mbl_no ?? null,
      // server-generated, never the caller's value
      uniqueId: uuidv4(),
    });

    // never echo the password hash back
    const { password, ...rest } = saved;
    return rest;
  }

}
