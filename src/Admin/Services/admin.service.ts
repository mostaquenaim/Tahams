import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminForm } from '../DTOs/adminform.dto';
import { Repository, FindManyOptions } from 'typeorm';
import { AdminEntity } from '../Entities/admin.entity';
import { CustomerEntity } from 'src/Customer/Entities/customer.entity';
import { ProductEntity } from 'src/Global/Entities/product.entity';
import { BannerEntity } from 'src/Global/Entities/banner.entity';
import * as bcrypt from 'bcrypt';
import { MailerService } from "@nestjs-modules/mailer/dist";

@Injectable()
export class AdminService {

  constructor(
    @InjectRepository(AdminEntity)
    private adminRepo: Repository<AdminEntity>,
    private mailerService: MailerService,

    @InjectRepository(CustomerEntity)
    private customerRepo: Repository<CustomerEntity>,

    @InjectRepository(ProductEntity)
    private productRepo: Repository<ProductEntity>,

    @InjectRepository(BannerEntity)
    private bannerRepo: Repository<BannerEntity>,

    // @InjectRepository(UserEntity)
    // private userRepo:Repository<UserEntity>,


  ) { }

  getHello(): string {
    return 'Hello World!';
  }

  getName(): string {
    return 'my name is khan'
  }

  async createUser(myDto) {
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(myDto.password, salt);
    myDto.password = hashedPass;
    return this.adminRepo.save(myDto);
  }

  // send email 
  async sendEmail(mydto){

    return   await this.mailerService.sendMail({
           to: mydto.email,
           subject: mydto.subject,
           text: mydto.text, 
         });
   }
   
  // admin login 
  async signIn(myDto) {

    const myData = await this.adminRepo.findOneBy({ email: myDto.email });
    if (!myData) {
      return 0;
    }
    if (myDto.password == myData.password) {
      return true;
    }
    return false;

  }

  // update admin profile 
  async updateAdmin(myDto: AdminForm, email: string) {
    try {
      const result = await this.adminRepo.update({ email: email }, myDto);
      if (result.affected === 0) {
        return 'Admin not found';
      } else {
        return 'Admin updated';
      }
    } catch (err) {
      // An error occurred during the update operation
      console.error(err);
      return 'Update failed';
    }
  }

  // delete banner image 
  async deleteBannerImage(filename) {

    const myData = await this.bannerRepo.findOneBy({ filename: filename });

    if (myData)
      return this.bannerRepo.delete(myData);
    return false;
  }

  // add new product 
  async addNewProduct(myDto) {
    return this.productRepo.save(myDto);
  }

  // view all product 
  async viewAllProduct() {
    const options: FindManyOptions<ProductEntity> = {};
    const products = await this.productRepo.find(options);
    return products;
  }

}
