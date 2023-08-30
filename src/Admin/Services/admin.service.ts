import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminForm } from '../DTOs/adminform.dto';
import { Repository, FindManyOptions } from 'typeorm';
import { AdminEntity } from '../Entities/admin.entity';
import { CustomerEntity } from 'src/Customer/Entities/customer.entity';
import { ProductEntity } from 'src/Global/Entities/product.entity';
import { BannerEntity } from 'src/Global/Entities/banner.entity';
import * as bcrypt from 'bcrypt';
import { MailerService } from "@nestjs-modules/mailer/dist";
import { CategoryEntity } from 'src/Global/Entities/category.entity';

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

    @InjectRepository(CategoryEntity)
    private categoryRepo: Repository<CategoryEntity>,

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

  // view product category 
  async viewProductCategories(){
    const options: FindManyOptions<CategoryEntity> = {};
    const categories = await this.categoryRepo.find(options);
    return categories;
  }

  // get category by id 
  async getCategoryById(id){
    return await this.categoryRepo.findOneBy({ id });
  }

  // update category by id 
  async updateCategory(id: number, category) {

    const user = await this.categoryRepo.findOneBy({id});
  
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
  
    await this.categoryRepo.update(id, { ...category });
  }

  // delete category by id 
  async deleteCategoryById(id: number) {

    const user = await this.categoryRepo.findOneBy({id});
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`); 
    }
    await this.categoryRepo.delete(user);

  }


  // create new category 
  async createNewCategory(
    myDto,
  ) {
    // const user = await this.adminRepo.findOneBy({ id });
    // if (!user)
    //   throw new HttpException(
    //     'User not found. Cannot Add Vehicle Information',
    //     HttpStatus.BAD_REQUEST,
    //   );
    const newCategory = this.categoryRepo.create({
      ...myDto
    });
    console.log(newCategory)
    return this.categoryRepo.save(newCategory);
  }

  // change category image 
  async changeCategoryImage(id, myFile) {
    const user = await this.categoryRepo.findOneBy({ id });
  
    if (user) {
      user.filename = myFile; // Update the filename property with the new file value
      return await this.categoryRepo.save(user); // Save the updated user entity
    }
  
    return null; // Return null if no user found with the provided email
  }
}
