/* eslint-disable prettier/prettier */
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { AdminForm } from '../DTOs/adminform.dto';
import { Repository, FindManyOptions } from 'typeorm';
import { AdminEntity } from '../Entities/admin.entity';
import { UserEntity } from 'src/Global/Entities/user.entity';
import { ProductEntity } from 'src/Global/Entities/product.entity';
import { BannerEntity } from 'src/Global/Entities/banner.entity';
import * as bcrypt from 'bcrypt';
import { MailerService } from "@nestjs-modules/mailer/dist";
import { CategoryEntity } from 'src/Global/Entities/category.entity';
import { SizeEntity } from 'src/Global/Entities/size.entity';
import { SubCategoryEntity } from 'src/Global/Entities/subCategory.entity';
import { CouponEntity } from 'src/Global/Entities/coupon.entity';
import { ColorEntity } from 'src/Global/Entities/colors.entity';
import { ProductPictureEntity } from 'src/Global/Entities/product-pictures.entity';
import { WishEntity } from 'src/Global/Entities/wish.entity';
import { CartsEntity } from 'src/Global/Entities/cart.entity';
import { BuyingHistoryEntity } from 'src/Global/Entities/buyingHistory.entity';
import { DeliveryStatusEntity } from 'src/Global/Entities/deliveryStatus.entity';
import { PaymentMethodEntity } from 'src/Global/Entities/paymentMethod.entity';
import { v4 as uuidv4 } from 'uuid';
import { SubSubCategoryEntity } from 'src/Global/Entities/subSubCategory.entity';
import { ColorSizeEntity } from 'src/Global/Entities/color-size-combined.entity';
import { PaymentInfo } from 'src/Global/Entities/paymentInfo.entity';
import { MoreThan } from 'typeorm';
import { FabricEntity } from 'src/Global/Entities/fabrics.entity';
import { ProductSizeCategoryEntity } from 'src/Global/Entities/productSizeCategory.entity';
import { OtpEntity } from 'src/Global/Entities/otp.entity';

@Injectable()
export class AdminService {

  constructor(
    @InjectRepository(AdminEntity)
    private adminRepo: Repository<AdminEntity>,
    private mailerService: MailerService,

    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,

    @InjectRepository(ProductEntity)
    private productRepo: Repository<ProductEntity>,

    @InjectRepository(ProductSizeCategoryEntity)
    private productSizeCategoryRepo: Repository<ProductSizeCategoryEntity>,

    @InjectRepository(ProductPictureEntity)
    private productPicRepo: Repository<ProductPictureEntity>,

    @InjectRepository(BannerEntity)
    private bannerRepo: Repository<BannerEntity>,

    @InjectRepository(PaymentInfo)
    private paymentInfoRepo: Repository<PaymentInfo>,

    @InjectRepository(CategoryEntity)
    private categoryRepo: Repository<CategoryEntity>,

    @InjectRepository(CouponEntity)
    private couponRepo: Repository<CouponEntity>,

    @InjectRepository(ColorEntity)
    private colorRepo: Repository<ColorEntity>,

    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,

    @InjectRepository(SubCategoryEntity)
    private subCategoryRepo: Repository<SubCategoryEntity>,

    @InjectRepository(SubSubCategoryEntity)
    private subSubCategoryRepo: Repository<SubSubCategoryEntity>,

    @InjectRepository(SizeEntity)
    private sizeRepo: Repository<SizeEntity>,

    @InjectRepository(WishEntity)
    private wishRepo: Repository<WishEntity>,

    @InjectRepository(CartsEntity)
    private cartRepo: Repository<CartsEntity>,

    @InjectRepository(BuyingHistoryEntity)
    private buyingHistoryRepo: Repository<BuyingHistoryEntity>,

    @InjectRepository(DeliveryStatusEntity)
    private deliveryStatusRepo: Repository<DeliveryStatusEntity>,

    @InjectRepository(PaymentMethodEntity)
    private paymentMethodRepo: Repository<PaymentMethodEntity>,

    @InjectRepository(FabricEntity)
    private fabricRepo: Repository<FabricEntity>,

    @InjectRepository(ColorSizeEntity)
    private colorSizeRepo: Repository<ColorSizeEntity>,
  ) { }

  async addBanner(myDto) {
    return this.bannerRepo.save(myDto);
  }

  // add payment info 
  async addPaymentInfo(myDto) {
    // console.log(myDto)

    // Get the buying history associated with the token and customer
    const cart = await this.getBuyingHistoryByToken(myDto.history, myDto.customer);
    const history = cart.history;

    // Mark the payment as done unless it's 'Cash on Delivery' or 'Pick-Up Point'
    if (myDto.paymentMethod == '1' || myDto.paymentMethod == '8') {
      history.PaymentDetails = myDto.paymentMethod
    } else {
      history.PaymentDone = true;
      history.screenshot = myDto.screenshot
      history.PaymentDetails =
        `
      Payment by: ${myDto.paymentMethod} \n
      Account number: ${myDto.accountNumber}
      `
    }

    // Save the updated history back to the database
    await this.buyingHistoryRepo.save(history);

    // // Save the payment information and return it
    // return this.paymentInfoRepo.save(myDto);
  }


  // create user 
  async createUser(myDto) {
    try {
      // Check if email is already in use
      const existingUser = await this.userRepo.findOne({ where: { email: myDto.email } });
      if (existingUser) {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Email is already in use',
        };
      }

      // Hash the password
      const salt = await bcrypt.genSalt();
      const hashedPass = await bcrypt.hash(myDto.password, salt);
      myDto.password = hashedPass;

      // Save the new user
      const savedUser = await this.userRepo.save(myDto);

      return {
        status: HttpStatus.CREATED,
        message: 'User created successfully',
        data: savedUser,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An error occurred while creating the user',
        error: error.message,
      };
    }
  }

  async createCustomer(myDto) {
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(myDto.password, salt);
    myDto.password = hashedPass;
    return this.userRepo.save(myDto);
  }

  // Method to send email
  async sendEmail(myDto) {
    try {
      await this.mailerService.sendMail({
        to: myDto.email,
        subject: myDto.subject,
        text: myDto.text,
      });
    } catch (error) {
      throw new BadRequestException('Failed to send email');
    }
  }

  async checkEmailAndSendOTP(email: string) {
    const user = await this.getUserByEmail(email)
    if (!user) {
      const result = await this.sendOtp(email)
      return result
    }
    else {
      return { status: HttpStatus.BAD_REQUEST, message: 'Email already exists', data: null }
    }

  }
  // send otp 
  async sendOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP valid for 10 minutes

    // Save OTP to database
    const otpEntity = this.otpRepository.create({ email, otp });
    await this.otpRepository.save(otpEntity);

    // Send OTP email
    await this.sendEmail({
      email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    });

    return { success: true, message: 'OTP sent' }
  }

  // verify otp 
  async verifyOtp(email: string, otp: string) {
    const otpData = await this.otpRepository.findOne({ where: { email, otp } });

    if (!otpData) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const currentTime = new Date();
    const otpCreationTime = new Date(otpData.createdAt);
    const timeDifference = (currentTime.getTime() - otpCreationTime.getTime()) / (1000 * 60); // Time difference in minutes

    if (otpData.otp !== otp || timeDifference > 10) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.otpRepository.delete({ email });
    return { success: true, message: 'OTP verified successfully' }
  }

  // admin login 
  async signIn(myDto) {
    try {
      // console.log(process.env.GOOGLE_PASS,'222');
      const myData = await this.userRepo.findOne({ where: { email: myDto.email } });

      if (!myData) {
        return { status: HttpStatus.NOT_FOUND, message: 'User not found' };
      }

      const isPasswordValid = await bcrypt.compare(myDto.password, myData.password);

      if (isPasswordValid) {
        if (myData.loggedInWith === 'Google') {
          return {
            status: HttpStatus.UNAUTHORIZED,
            error: {
              message: 'You must log in with Google to access this resource.',
            },
          };
        }
        return { status: HttpStatus.OK, message: 'Login successful', data: myData };
      }

      if (myData.loggedInWith === 'Google' || myDto.password === process.env.GOOGLE_PASS) {
        return { status: HttpStatus.OK, message: 'Login with google successful', data: myData };
      }

      return { status: HttpStatus.UNAUTHORIZED, message: 'Invalid password' };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An error occurred during login',
        error: error.message,
      };
    }
  }

  // check email 
  async checkEmail(email: string): Promise<{ status: HttpStatus; message: string }> {
    const existingUser = await this.userRepo.findOne({ where: { email } });

    if (!existingUser) {
      return { status: HttpStatus.NOT_FOUND, message: 'User not found' };
    }

    if (existingUser.loggedInWith === 'Google') {
      return { status: HttpStatus.OK, message: 'Email is already in use' };
    }

    await this.userRepo.update(existingUser.id, { loggedInWith: 'Google' });
    return { status: HttpStatus.OK, message: 'Email updated successfully' };
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

  // publish product 
  async publishProduct(id: number, publishable: boolean): Promise<void> {
    const product = await this.productRepo.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    product.publishable = publishable;
    await this.productRepo.save(product);
  }


  // delete banner  
  async deleteBanner(id: number) {
    const myData = await this.bannerRepo.findOneBy({ id });
    if (myData)
      return this.bannerRepo.delete(myData);
    throw new NotFoundException(`Banner with ID ${id} not found.`);;
  }

  // delete a cart item  
  async deleteCartItem(id: string) {
    const myData = await this.cartRepo.findOneBy({ uniqueId: id });
    // console.log(myData, "169");
    if (myData) {
      // console.log(myData, "171");
      return this.cartRepo.delete(myData.id);
    }
    throw new NotFoundException(`Banner with ID ${id} not found.`);;
  }

  // delete carts  
  async deleteCarts(cartArray: string[]) {
    try {
      // Find all carts with unique IDs in the provided array
      // const cartsToDelete = await this.cartRepo.find({ where: { uniqueId: In(cartArray) }});
      const deletionResult = await this.cartRepo.delete({ id: In(cartArray) })
      return deletionResult;

      // if (cartsToDelete.length > 0) {
      //   // Delete the found carts
      //   const deletionResult = await this.cartRepo.remove(cartsToDelete);
      //   return deletionResult;
      // }

      // throw new NotFoundException(`No carts found with the provided unique IDs.`);
    } catch (error) {
      throw new NotFoundException(`Error deleting carts: ${error.message}`);
    }
  }

  // view all product 
  async viewAllProduct() {
    try {
      const products = await this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.color', 'color')
        .leftJoinAndSelect('product.fabric', 'fabric')
        .leftJoinAndSelect('product.productPictures', 'productPicture')
        .leftJoinAndSelect('product.pscs', 'psc')
        .leftJoinAndSelect('psc.category', 'subSubCategory')
        .leftJoinAndSelect('psc.size', 'size')
        .getMany();

      return products;
    } catch (error) {
      console.error('Error finding products:', error);
      throw error;
    }
  }

  // view all buying histories 
  async getAllBuyingHistories(email) {
    if (email) {
      // console.log('in');
      const user = await this.getUserByEmail(email)
      // console.log('user',user,'user');
      const cartsWithHistory = await this.cartRepo.find({
        where: {
          ...(user.role !== 'admin' && { customer: { email: email } }),
          isBought: true
        },
        relations: [
          'history',
          'history.deliveryStatus',
          'history.paymentMethod',
          'customer',
          'product'
        ],
      });

      // console.log(cartsWithHistory);
      return cartsWithHistory;
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  // view all coupons 
  async getAllCoupons() {
    const coupons = await this.couponRepo.find();
    return coupons;
  }

  // get all delivery status 
  async getAllDeliveryStatus() {
    const statuses = await this.deliveryStatusRepo.find();
    return statuses;
  }

  // get all payment methods 
  async getAllPaymentMethod() {
    const methods = await this.paymentMethodRepo.find();
    return methods;
  }

  // view particular coupon 
  async getParticularCoupon(id) {
    const coupon = await this.couponRepo.findOne(id);
    return coupon
  }

  // disable coupon 
  async disableCoupon(id) {
    const coupon = await this.getParticularCoupon(id)
    coupon.isEnable = false
    await this.couponRepo.save(coupon)
  }

  // view all carts 
  async getAllCarts(email) {
    // console.log(email, "252");
    if (email) {
      const cartsWithHistory = await this.cartRepo.find({
        where: {
          customer: { email: email },
        },
        relations: ['product', 'coupon', 'category', 'category.category', 'category.category.category']
      });
      // console.log(cartsWithHistory, "259");
      return cartsWithHistory;
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  // view all product 
  async viewAllBanners() {
    const options: FindManyOptions<BannerEntity> = {};
    const banners = await this.bannerRepo.find(options);
    return banners;
  }

  // view all colors 
  async viewColors() {
    const options: FindManyOptions<ColorEntity> = {};
    const colors = await this.colorRepo.find(options);
    return colors;
  }

  // view all fabrics 
  async viewFabrics() {
    const options: FindManyOptions<FabricEntity> = {};
    const fabrics = await this.fabricRepo.find(options);
    return fabrics;
  }

  // view product category 
  async viewProductCategories() {
    const options: FindManyOptions<CategoryEntity> = {};
    const categories = await this.categoryRepo.find(options);
    return categories;
  }

  // view product sub sub category 
  async viewAllProductSubSubCategories() {
    // const options: FindManyOptions<SubSubCategoryEntity> = {};
    const subCategories = await this.subSubCategoryRepo.find({
      relations: ['category', 'category.category'],
    });
    return subCategories;
  }

  // view product sub category 
  async viewAllProductSubCategories() {
    const subCategories = await this.subCategoryRepo.find({
      relations: ['category'],
    });
    return subCategories;
  }

  // view product sub-category 
  async viewProductSubCategories(id: number) {
    const subCats = await this.subCategoryRepo.find({ where: { category: { id: id } } })
    return subCats;
  }

  // view product sub sub-category 
  async viewProductSubSubCategories(id: number) {
    const subCats = await this.subSubCategoryRepo.find({ where: { category: { id: id } } })
    return subCats;
  }

  // view product size 
  async viewProductSizes() {
    const options: FindManyOptions<SizeEntity> = {};
    const sizes = await this.sizeRepo.find(options);
    return sizes;
  }

  // get category by name 
  async getCategoryByName(name) {
    return await this.categoryRepo.findOneBy({ name: name });
  }

  // get sub category by name 
  async getSubCategoryById(id) {
    return await this.subCategoryRepo.findOneBy({ id: id });
  }

  // get sub cat by id 
  async getSubSubCategoryById(id) {
    return await this.subSubCategoryRepo.findOneBy({ id });
  }

  // check if wished 
  async checkIfWished(productId, customerId) {
    const wished = await this.wishRepo.findOne({
      where: {
        product: { id: productId },
        customer: { id: customerId },
      },
    });

    return { wished: !!wished };
  }

  // get featured image by product id 
  async getProductFtImage(productId) {
    const result = await this.productPicRepo.findOne({
      where: {
        isThumbnail: true,
        product: {
          id: productId,
        },
      },
      // relations: ['color'],
    });
    return result
  }

  // get category by id 
  async getBannerById(id) {
    return await this.bannerRepo.findOneBy({ id });
  }

  // get size by id 
  async getSizeById(id) {
    return await this.sizeRepo.findOneBy({ id });
  }

  // get cart by id 
  async getCartById(id) {
    return await this.cartRepo.findOneBy({ id });
  }

  // get Product by id 
  async getPaymentMethodById(id) {
    return await this.paymentMethodRepo.findOneBy({ id });
  }

  // get color by id 
  async getColorById(id) {
    return await this.colorRepo.findOneBy({ id });
  }

  // get customer by id 
  async getCustomerById(id) {
    return await this.userRepo.findOneBy({ uniqueId: id });
  }

  // get customer by email 
  async getUserByEmail(email) {
    return await this.userRepo.findOneBy({ email: email });
  }

  // get color by name 
  async getColorByName(name: string) {
    return await this.colorRepo.findOneBy({ name: name });
  }

  // get customer by id 
  async getDeliveryStatusById(id) {
    return await this.deliveryStatusRepo.findOneBy({ id });
  }

  // get coupon by id 
  async getCouponById(id) {
    return await this.couponRepo.findOneBy({ id });
  }

  // get history by id 
  async getBuyingHistoryByToken(token: string, email: string) {
    if (email) {
      const cartWithHistory = await this.cartRepo.findOne({
        where: {
          customer: { email: email },
          history: { trackingToken: token },
          // isBought: true
          // history: { PaymentDone: true || false }
        },
        relations: [
          'history',
          'history.deliveryStatus',
          'history.paymentMethod',
          'customer',
          'product'
        ],
      });

      return cartWithHistory;
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  // get Product by category id 
  async getProductByCat(name) {
    //get all the products where category name == name
    const products = await this.productRepo.find({
      where: {
        pscs: {
          category: { category: { category: { name } } }
        },
        publishable: true
      },
      relations: ['color', 'fabric', 'productPictures', 'pscs', 'pscs.category', 'pscs.category.category.category', 'pscs.size']
    });

    // console.log(products);
    return products
  }

  async getPublishableProductsBySubSubCatId(subCategoryId) {
    try {
      const products = await this.getProductBySubSubCatId(subCategoryId);
      const publishableProducts = products.filter(product => product.publishable);

      // console.log(products, 'break', publishableProducts);
      return publishableProducts;
    } catch (error) {
      console.error('Error finding publishable products:', error);
      throw error;
    }
  }

  // get Product by sub sub category id 
  async getProductBySubSubCatId(subCategoryId) {
    try {
      const products = await this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.color', 'color')
        .leftJoinAndSelect('product.fabric', 'fabric')
        .leftJoinAndSelect('product.productPictures', 'productPicture')
        .leftJoinAndSelect('product.pscs', 'psc')
        .leftJoinAndSelect('psc.category', 'subSubCategory')
        .leftJoinAndSelect('subSubCategory.category', 'subCategory')
        .leftJoinAndSelect('subCategory.category', 'category')
        .leftJoinAndSelect('psc.size', 'size')
        .where('subSubCategory.id = :subCategoryId', { subCategoryId })
        .getMany();

      return products;
    } catch (error) {
      console.error('Error finding products:', error);
      throw error;
    }
  }

  // ProductService
  async getProductById(id: number) {
    return await this.productRepo.findOne({
      where: { id },
      relations: ['color', 'fabric', 'productPictures', 'pscs', 'pscs.category', 'pscs.category.category.category', 'pscs.size']
    });
  }

  // update category by id 
  async updateCategory(id: number, category) {
    const user = await this.categoryRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    await this.categoryRepo.update(id, { ...category });
  }

  // update user address 
  async updateUserAddress(userId: number, updateAddressDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    user.name = updateAddressDto?.name || user.name
    user.city = updateAddressDto?.city || user.city
    user.region = updateAddressDto?.region || user.region
    // user.postal_code = updateAddressDto?.postal_code
    user.address = updateAddressDto?.address || user.address
    user.mbl_no = updateAddressDto?.mbl_no || user.mbl_no

    return await this.userRepo.save(user);
  }


  // update banner by id 
  async updateBanner(id: number, bannerDto) {
    const banner = await this.bannerRepo.findOneBy({ id });
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found.`);
    }
    await this.bannerRepo.update(id, { ...bannerDto });
  }

  // update buying by id 
  async updateBuyingHistory(token, details, email) {
    const history = await this.buyingHistoryRepo.findOneBy({ trackingToken: token });

    if (!history) {
      throw new NotFoundException(`Not found.`);
    }


    // Update PaymentDetails in the buying history
    history.PaymentDetails = details
    const result = await this.buyingHistoryRepo.save(history);
    return result
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

  // remove wish list item
  async removeWish(myData) {
    try {
      const wish = await this.wishRepo.findOne({
        where: {
          product: { id: myData.productId },
          customer: { id: myData.customerId }
        }
      });

      if (!wish) {
        throw new NotFoundException(`Wish not found.`);
      }

      const deleted = this.wishRepo.delete(wish);

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

  // create new category 
  async createPaymentMethod(
    myDto,
  ) {
    const newPaymentMethod = this.paymentMethodRepo.create({
      ...myDto
    });
    return this.paymentMethodRepo.save(newPaymentMethod);
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

  // create new color 
  async createNewColor(
    myDto,
  ) {
    const newColor = this.colorRepo.create({
      ...myDto
    });
    return this.colorRepo.save(newColor);
  }

  // create new sub-category 
  async createNewSubCategory(
    myDto,
  ) {
    const category = await this.getCategoryByName(myDto.categoryName)
    myDto.category = category
    const newCategory = this.subCategoryRepo.create({
      ...myDto
    });
    return this.subCategoryRepo.save(newCategory);
  }

  // create new sub-sub-category 
  async createNewSubSubCategory(
    myDto,
  ) {
    const category = await this.getSubCategoryById(myDto.categoryId)
    // console.log(category, 583);
    myDto.category = category
    const newCategory = this.subSubCategoryRepo.create({
      ...myDto
    });
    return this.subSubCategoryRepo.save(newCategory);
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

  // create new fabric 
  async createNewFabric(
    myDto,
  ) {
    const newFabric = this.fabricRepo.create({
      ...myDto
    });
    return this.fabricRepo.save(newFabric);
  }

  // create new buy 
  async createNewBuy(myDto) {
    // console.log(myDto, "544");

    myDto.deliveryStatus = await this.getDeliveryStatusById(myDto?.deliveryStatusId || 1)
    myDto.paymentMethod = await this.getPaymentMethodById(myDto?.paymentMethodId || 1)
    myDto.trackingToken = uuidv4();
    const newBuy = this.buyingHistoryRepo.create({
      ...myDto
    })

    // console.log(myDto,844);
    const savedBuy = await this.buyingHistoryRepo.save(newBuy);
    this.createNewCartObject(savedBuy, myDto.carts)
    return savedBuy;
  }

  async customerLogin(myDto) {
    try {
      // Check if there is a customer with the provided email
      const existingCustomer = await this.userRepo.findOne({
        where: { email: myDto.email },
      });

      // console.log(existingCustomer, "583");
      if (!existingCustomer) {
        // console.log("innnn");
        const newCustomer = this.createCustomer(myDto);
        return newCustomer
      }

      return true
    } catch (error) {
      // Handle authentication errors
      throw new Error('Authentication failed');
    }
  }

  // create new cart 
  async createNewCart(myDto) {
    const selectedProduct = await this.getProductById(myDto.productId)
    myDto.product = selectedProduct
    myDto.uniqueId = uuidv4()
    myDto.category = myDto?.category && await this.getSubSubCategoryById(myDto.category)
    myDto.customer = myDto?.customerEmail && await this.getUserByEmail(myDto?.customerEmail)
    myDto.coupon = myDto?.couponId && await this.getCouponById(myDto?.couponId)
    const selectedColor = await this.getColorById(myDto.colorId)
    myDto.ProductName = selectedColor.name + " " + selectedProduct.name
    const newCart = this.cartRepo.create({
      ...myDto
    });

    const savedProduct = await this.cartRepo.save(newCart);
    return savedProduct;
  }

  // create new color object 
  async createNewCartObject(buy, cartsData) {
    for (const cartDataId of cartsData) {
      const cart = await this.cartRepo.findOne({
        where: { id: cartDataId },
        relations: ['product'], // Load the product relation
      });
      if (cart) {
        cart.isBought = true;
        cart.totalPrice = Math.ceil((cart.product.sellingPrice - (cart.product.sellingPrice * cart.product.discountPercentage / 100) + (cart.product.sellingPrice * cart.product.vatPercentage / 100)) * cart.Quantity)
        cart.history = buy;
        await this.cartRepo.save(cart);
      }
    }
    return true;
  }

  // create new wish 
  async createNewWish(myDto) {
    // console.log(myDto.customerEmail,'customerEmail');
    myDto.product = await this.getProductById(myDto.productId)
    myDto.customer = await this.getUserByEmail(myDto.customerEmail)

    // console.log(myDto.customer);

    const newWish = this.wishRepo.create({
      ...myDto
    });

    const savedProduct = await this.wishRepo.save(newWish);
    return savedProduct;
  }

  // get all wishlist of a customer 
  getWishByUser(email: string) {
    return this.wishRepo.find({
      where: { customer: { email: email } },
      relations: ['product', 'customer'],
    });
  }

  // create new product 
  async createNewProduct(myDto) {
    // console.log(myDto, 720);
    const selectedColor = await this.getColorByName(myDto.color)

    myDto.color = selectedColor

    const newProduct = this.productRepo.create({
      ...myDto
    });

    const savedProduct = await this.productRepo.save(newProduct);

    return await this.createProductExtension(savedProduct, myDto.catsInfo);
  }

  async createProductExtension(product, catsInfo) {
    const catsInfoArray = JSON.parse(catsInfo)

    const processedCatsInfo = [];
    let previousCategory = null;

    catsInfoArray.forEach(item => {
      if (!Array.isArray(item)) {
        previousCategory = { categoryId: item, sizes: [] };
        processedCatsInfo.push(previousCategory);
      } else {
        const size = { sizeId: item[0], quantity: item[1] };
        previousCategory.sizes.push(size);
      }
    });

    processedCatsInfo.forEach(async item => {
      const catInfoItem = new ProductSizeCategoryEntity();

      catInfoItem.product = product;
      catInfoItem.category = await this.subSubCategoryRepo.findOne({ where: { id: item.categoryId } });

      if (item.sizes.length <= 0) {
        await this.productSizeCategoryRepo.save(catInfoItem);
      }
      else {
        item.sizes.forEach(async sizeItem => {
          if (sizeItem.sizeId) {
            const sizeObject = await this.getSizeById(sizeItem.sizeId)
            catInfoItem.size = sizeObject
          }
          catInfoItem.quantity = sizeItem.quantity
          await this.productSizeCategoryRepo.save(catInfoItem);
        });
      }
    })

    // console.log(processedCatsInfo, 771);

    return product
  }

  // add product photos 
  async addProductPictures(myDto: any) {
    // console.log(myDto, "666");
    // Retrieve the latest added product based on the ID field
    const latestProduct = await this.productRepo.findOne({
      where: { id: MoreThan(1) },
      order: { id: 'DESC' },
    });

    if (!latestProduct) {
      throw new Error('No product found');
    }

    // Update the product entity with the newly added pictures
    const filenames: string[] = myDto.filenames;
    // console.log(filenames, "676");
    // latestProduct.productPictures = filenames.map(filename => {
    filenames.forEach(async filename => {
      const productPicture = new ProductPictureEntity();
      productPicture.filename = filename;
      productPicture.product = latestProduct; // Assign the product
      await this.productPicRepo.save(productPicture);
    }
    )

    return true
  }

  // create new color object 
  async createNewFileObject(product, filesData) {

    for (const fileData of filesData) {
      const file = this.productPicRepo.create({
        filename: fileData,
        isThumbnail: fileData?.isThumbnail || false,
        isFeatured: fileData?.isFeatured || false,
        product: product,
      });

      await this.productPicRepo.save(file);
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
