/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
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
import { SizeEntity } from 'src/Global/Entities/size.entity';
import { SubCategoryEntity } from 'src/Global/Entities/subCategory.entity';
import { CouponEntity } from 'src/Global/Entities/coupon.entity';
import { ColorEntity } from 'src/Global/Entities/colors.entity';

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

    @InjectRepository(CouponEntity)
    private couponRepo: Repository<CouponEntity>,

    @InjectRepository(ColorEntity)
    private colorRepo: Repository<ColorEntity>,

    @InjectRepository(SubCategoryEntity)
    private subCategoryRepo: Repository<SubCategoryEntity>,

    @InjectRepository(SizeEntity)
    private sizeRepo: Repository<SizeEntity>,
    // @InjectRepository(UserEntity)
    // private userRepo:Repository<UserEntity>,
  ) { }

  async addBanner(myDto) {
    return this.bannerRepo.save(myDto);
  }


  async createUser(myDto) {
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(myDto.password, salt);
    myDto.password = hashedPass;
    return this.adminRepo.save(myDto);
  }

  // send email 
  async sendEmail(mydto) {

    return await this.mailerService.sendMail({
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

  // delete banner  
  async deleteBanner(id: number) {
    const myData = await this.bannerRepo.findOneBy({ id });
    if (myData)
      return this.bannerRepo.delete(myData);
    throw new NotFoundException(`Banner with ID ${id} not found.`);;
  }

  // add new product 
  async addNewProduct(myDto) {
    const newCategory = await this.getCategoryById(myDto.categoryId)

    const newProduct = this.productRepo.create({
      ...myDto,
      category: newCategory
    });

    return this.productRepo.save(newProduct);
  }

  // view all product 
  async viewAllProduct() {
    const options: FindManyOptions<ProductEntity> = {};
    const products = await this.productRepo.find(options);
    return products;
  }

  // view product category 
  async viewProductCategories() {
    const options: FindManyOptions<CategoryEntity> = {};
    const categories = await this.categoryRepo.find(options);
    return categories;
  }

  // view product sub-category 
  async viewProductSubCategories() {
    const options: FindManyOptions<SubCategoryEntity> = {};
    const subCategories = await this.subCategoryRepo.find(options);
    return subCategories;
  }

  // view product size 
  async viewProductSizes() {
    const options: FindManyOptions<SizeEntity> = {};
    const sizes = await this.sizeRepo.find(options);
    return sizes;
  }

  // get category by id 
  async getCategoryById(id) {
    return await this.categoryRepo.findOneBy({ id });
  }

  // get Product by id 
  async getProductById(id) {
    return await this.productRepo.findOneBy({ id });
  }

  // get Product by category id 
  async getProductByCatId(id) {
    return await this.productRepo.findOneBy({ id });
  }

  // update category by id 
  async updateCategory(id: number, category) {
    const user = await this.categoryRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    await this.categoryRepo.update(id, { ...category });
  }

  // update banner by id 
  async updateBanner(id: number, bannerDto) {
    const banner = await this.bannerRepo.findOneBy({ id });
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found.`);
    }
    await this.bannerRepo.update(id, { ...bannerDto });
  }

  // delete product by id 
  async deleteProductById(id: number) {
    try {
      const product = await this.productRepo.findOneBy({ id });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found.`);
      }

      const deleted = this.productRepo.delete(product);
      return deleted;
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }

  // delete size by id 
  async deleteSizeById(id: number) {
    try {
      const size = await this.sizeRepo.findOneBy({ id });

      if (!size) {
        throw new NotFoundException(`Size with ID ${id} not found.`);
      }

      const deleted = this.sizeRepo.delete(size);

      return deleted;
    } catch (error) {
      console.error('Error deleting size:', error);
    }
  }

  // create new category 
  async createNewCategory(
    myDto,
  ) {
    const newCategory = this.categoryRepo.create({
      ...myDto
    });
    return this.categoryRepo.save(newCategory);
  }

  // create new coupon 
  async createNewCoupon(
    myDto,
  ) {
    const newCoupon = this.couponRepo.create({
      ...myDto
    });
    return this.couponRepo.save(newCoupon);
  }

  // create new sub-category 
  async createNewSubCategory(
    myDto,
  ) {
    const newCategory = this.subCategoryRepo.create({
      ...myDto
    });
    return this.subCategoryRepo.save(newCategory);
  }


  // create new size 
  async createNewSize(
    myDto,
  ) {
    const newSize = this.sizeRepo.create({
      ...myDto
    });
    return this.sizeRepo.save(newSize);
  }

  // create new product 
  async createNewProduct(myDto) {
    const newProduct = this.productRepo.create({
      ...myDto
    });

    const savedProduct = await this.productRepo.save(newProduct);
    this.createNewColorObject(savedProduct, myDto.colors)
    return savedProduct;
  }

  // create new color object 
  async createNewColorObject(product, colorsData) {

    for (const colorData of colorsData) {
      const color = this.colorRepo.create({
        colorCode: colorData.colorCode,
        name: colorData.colorName,
        quantity: colorData.quantity,
        product: product,
      });

      await this.colorRepo.save(color);
    }
      return true;
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

  // change banner image 
  async changeBannerImage(id: number, myFile: string) {
      const banner = await this.bannerRepo.findOneBy({ id });

      if (banner) {
        banner.filename = myFile; // Update the filename property with the new file value
        return await this.bannerRepo.save(banner); // Save the updated user entity
      }

      return null; // Return null if no user found with the provided email
    }
  }
