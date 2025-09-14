/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Like } from 'typeorm';
import { AdminForm } from '../DTOs/adminform.dto';
import { Repository, FindManyOptions } from 'typeorm';
import { AdminEntity } from '../Entities/admin.entity';
import { UserEntity } from 'src/Global/Entities/user.entity';
import { ProductEntity } from 'src/Global/Entities/product.entity';
import { BannerEntity } from 'src/Global/Entities/banner.entity';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer/dist';
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
import { ViewProductEntity } from 'src/Global/Entities/viewProduct.entity';
import { ReturnEntity } from 'src/Global/Entities/return.entity';
import { GenderEntity } from 'src/Global/Entities/gender.entity';
import { MessageEntity } from 'src/Global/Entities/messages.entity';
import { UnreadMessageEntity } from 'src/Global/Entities/unreadMessage.entity';
import { NewArrivalEntity } from 'src/Global/Entities/new-arrival.entity';
import { PopUpEntity } from 'src/Global/Entities/pop-up.entity';
import { ActivePopUpEntity } from 'src/Global/Entities/active-pop-up.entity';
import { JwtService } from '@nestjs/jwt';
import { BlacklistToken } from 'src/Global/Entities/blacklist-token.entity';
import { RoleEntity } from 'src/Global/Entities/roles.entity';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { CustomizationRequestEntity } from 'src/Global/Entities/customization-request.entity';
import { CustomImgElement } from 'src/Global/Entities/custom-img-element';
import { CustomTextElement } from 'src/Global/Entities/custom-text-element';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class AdminService {
  constructor(
    private jwtService: JwtService,
    private mailerService: MailerService,

    @InjectRepository(AdminEntity)
    private adminRepo: Repository<AdminEntity>,

    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,

    @InjectRepository(ActivePopUpEntity)
    private activePopRepo: Repository<ActivePopUpEntity>,

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

    @InjectRepository(CustomizationRequestEntity)
    private customReqRepo: Repository<CustomizationRequestEntity>,

    @InjectRepository(CustomImgElement)
    private customImgRepo: Repository<CustomImgElement>,

    @InjectRepository(CustomTextElement)
    private customTextRepo: Repository<CustomTextElement>,

    @InjectRepository(ColorEntity)
    private colorRepo: Repository<ColorEntity>,

    @InjectRepository(MessageEntity)
    private messageRepo: Repository<MessageEntity>,

    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,

    @InjectRepository(RoleEntity)
    private roleRepo: Repository<RoleEntity>,

    @InjectRepository(SubCategoryEntity)
    private subCategoryRepo: Repository<SubCategoryEntity>,

    @InjectRepository(SubSubCategoryEntity)
    private subSubCategoryRepo: Repository<SubSubCategoryEntity>,

    @InjectRepository(SizeEntity)
    private sizeRepo: Repository<SizeEntity>,

    @InjectRepository(ReturnEntity)
    private returnRepo: Repository<ReturnEntity>,

    @InjectRepository(UnreadMessageEntity)
    private unreadRepo: Repository<UnreadMessageEntity>,

    @InjectRepository(NewArrivalEntity)
    private newArrivalRepo: Repository<NewArrivalEntity>,

    @InjectRepository(PopUpEntity)
    private popUpRepo: Repository<PopUpEntity>,

    @InjectRepository(ViewProductEntity)
    private viewRepo: Repository<ViewProductEntity>,

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

    @InjectRepository(GenderEntity)
    private genderRepo: Repository<GenderEntity>,

    @InjectRepository(ColorSizeEntity)
    private colorSizeRepo: Repository<ColorSizeEntity>,

    @InjectRepository(BlacklistToken)
    private blackListRepo: Repository<BlacklistToken>,
  ) {}

  async addBanner(myDto) {
    return this.bannerRepo.save(myDto);
  }

  // add payment info
  async addPaymentInfo(myDto) {
    // console.log(myDto, 'payment')

    // Get the buying history associated with the token and customer
    const cart = await this.getBuyingHistoryByToken(
      myDto.history,
      myDto.customer,
    );
    const history = cart[0].history;

    const paymentMethod = await this.getPaymentMethodById(myDto.paymentMethod);
    history.paymentMethod = paymentMethod;

    // Mark the payment as done unless it's 'Cash on Delivery' or 'Pick-Up Point'
    if (myDto.paymentMethod == '1' || myDto.paymentMethod == '8') {
      history.PaymentDetails = paymentMethod.name;
    } else {
      history.PaymentDone = true;
      history.screenshot = myDto.screenshot;
      history.PaymentDetails = `
      Payment by: ${paymentMethod.name} \n
      Account number: ${myDto.accountNumber}
      `;
    }

    // Save the updated history back to the database
    await this.buyingHistoryRepo.save(history);
  }

  // create user
  async createUser(myDto) {
    try {
      // Check if email is already in use
      const existingUser = await this.userRepo.findOne({
        where: { email: myDto.email },
      });
      if (existingUser) {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Email is already in use',
        };
      }

      // Hash the password
      if (myDto.password) {
        const salt = await bcrypt.genSalt();
        const hashedPass = await bcrypt.hash(myDto.password, salt);
        myDto.password = hashedPass;
      }

      // Save the new user
      const savedUser = await this.userRepo.save(myDto);

      const jti = uuidv4();
      const payload = {
        email: savedUser.email,
        sub: savedUser.id,
        role: savedUser.role,
        jti,
      };

      const { password, ...userWithoutPassword } = savedUser;

      return {
        status: HttpStatus.CREATED,
        message: 'User created successfully',
        access_token: this.jwtService.sign(payload),
        jti,
        data: userWithoutPassword,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An error occurred while creating the user',
        error: error.message,
      };
    }
  }

  // create new role
  async createNewRole(myDto: { name: string }) {
    try {
      const existing = await this.roleRepo.findOne({
        where: { name: myDto.name.toLowerCase() },
      });
      if (existing) {
        return { status: HttpStatus.CONFLICT, message: 'Role already exists' };
      }

      const newRole = this.roleRepo.create({ name: myDto.name.toLowerCase() });
      await this.roleRepo.save(newRole);

      return {
        status: HttpStatus.CREATED,
        message: 'Role created successfully',
        data: newRole,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An error occurred while creating the role',
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
    console.log('ekhane');
    try {
      await this.mailerService.sendMail({
        to: myDto.email,
        subject: myDto.subject,
        text: myDto.text,
      });
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException('Failed to send email');
    }
  }

  async checkEmailAndSendOTP(email: string) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      const result = await this.sendOtp(email);
      return result;
    } else {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Email already exists',
        data: null,
      };
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

    console.log('thik ');
    // Send OTP email
    await this.sendEmail({
      email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    });

    return { success: true, message: 'OTP sent' };
  }

  // verify otp
  async verifyOtp(email: string, otp: string) {
    const otpData = await this.otpRepository.findOne({ where: { email, otp } });
    console.log(otpData, 'otpdd');

    if (!otpData) {
      console.log('bad otp');
      throw new BadRequestException('Invalid or expired OTP');
    }

    const currentTime = new Date();
    const otpCreationTime = new Date(otpData.createdAt);
    const timeDifference =
      (currentTime.getTime() - otpCreationTime.getTime()) / (1000 * 60); // Time difference in minutes

    if (otpData.otp !== otp || timeDifference > 10) {
      console.log('otp error');
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.otpRepository.delete({ email });
    return { success: true, message: 'OTP verified successfully' };
  }

  // admin login
  async signIn(myDto) {
    try {
      const myData = await this.userRepo.findOne({
        where: { email: myDto.email },
      });

      const jti = uuidv4();
      const payload = {
        email: myData.email,
        sub: myData.id,
        role: myData.role,
        jti,
      };

      if (!myData) {
        return { status: HttpStatus.NOT_FOUND, message: 'User not found' };
      }

      const isPasswordValid = await bcrypt.compare(
        myDto.password,
        myData.password,
      );

      if (isPasswordValid) {
        if (myData.loggedInWith === 'Google') {
          return {
            status: HttpStatus.UNAUTHORIZED,
            error: {
              message: 'You must log in with Google to access this resource.',
            },
          };
        }
        console.log('emailpass');
        return {
          status: HttpStatus.OK,
          message: 'Login successful',
          access_token: this.jwtService.sign(payload),
          jti,
          data: myData,
        };
      }

      if (
        myData.loggedInWith === 'Google' ||
        myDto.password === process.env.GOOGLE_PASS
      ) {
        console.log('google');
        // console.log('object =', this.jwtService.sign(payload));
        return {
          status: HttpStatus.OK,
          message: 'Login with google successful',
          access_token: this.jwtService.sign(payload),
          jti,
          data: myData,
        };
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

  // Store blacklisted token in the database
  async addToBlacklist(jti: string, exp: number) {
    const token = new BlacklistToken();
    token.jti = jti;
    token.expiry = Date.now() + exp * 1000; // Expiry in ms

    await this.blackListRepo.save(token);
  }

  // Check if token is blacklisted
  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const token = await this.blackListRepo.findOne({ where: { jti } });
    return token && token.expiry > Date.now(); // Token expired check
  }

  // check email
  async checkEmail(
    email: string,
  ): Promise<{ status: HttpStatus; message: string }> {
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
    if (myData) return this.bannerRepo.delete(myData);
    throw new NotFoundException(`Banner with ID ${id} not found.`);
  }

  // delete a cart item
  async deleteCartItem(id: string) {
    const myData = await this.cartRepo.findOneBy({ uniqueId: id });
    // console.log(myData, "169");
    if (myData) {
      // console.log(myData, "171");
      return this.cartRepo.delete(myData.id);
    }
    throw new NotFoundException(`Banner with ID ${id} not found.`);
  }

  // delete a history
  async deleteHistory(id: string, email: string) {
    // Check if the user is an admin
    const user = await this.userRepo.findOne({
      where: { email, role: 'admin' },
    });

    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    // Find the cart entry by unique ID
    const historyEntry = await this.buyingHistoryRepo.findOneBy({
      trackingToken: id,
    });

    // console.log(historyEntry);

    if (!historyEntry) {
      throw new NotFoundException(`History with ID ${id} not found.`);
    }

    // Delete the cart entry / make draft
    historyEntry.isDraft = true;
    const res = await this.buyingHistoryRepo.save(historyEntry);
    return res;
  }

  // delete carts
  async deleteCarts(cartArray: string[]) {
    try {
      // Find all carts with unique IDs in the provided array
      // const cartsToDelete = await this.cartRepo.find({ where: { uniqueId: In(cartArray) }});
      const deletionResult = await this.cartRepo.delete({ id: In(cartArray) });
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
  async viewAllProducts(filters: any) {
    try {
      const products = await this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.color', 'color')
        .leftJoinAndSelect('product.fabric', 'fabric')
        .leftJoinAndSelect('product.productPictures', 'productPicture')
        .leftJoinAndSelect('product.pscs', 'psc')
        .leftJoinAndSelect('psc.category', 'subSubCategory')
        .leftJoinAndSelect('psc.size', 'size')
        .andWhere(filters)
        .getMany();

      // console.log(products, 'prdsts');

      return products;
    } catch (error) {
      console.error('Error finding products:', error);
      throw error;
    }
  }

  // view related products
  async viewRelatedProducts(category: number, excludeId: number) {
    try {
      const products = await this.productRepo
        .createQueryBuilder('product')
        .addSelect('RANDOM()', 'rand') // ✅ Include RANDOM() in select list
        .leftJoinAndSelect('product.productPictures', 'productPicture')
        .leftJoinAndSelect('product.pscs', 'psc')
        .leftJoinAndSelect('psc.category', 'category')
        .leftJoinAndSelect('psc.size', 'size')
        .where('category.id = :catId', { catId: category })
        .andWhere('product.id != :excludeId', { excludeId })
        .orderBy('rand') // ✅ Order by the alias we just selected
        .take(4)
        .getMany();

      return products;
    } catch (error) {
      console.error('Error finding related products:', error);
      throw error;
    }
  }

  // get product by query
  async getProductByQuery(searchQuery: string) {
    try {
      const products = await this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.color', 'color')
        .leftJoinAndSelect('product.fabric', 'fabric')
        .leftJoinAndSelect('product.productPictures', 'productPicture')
        .leftJoinAndSelect('product.pscs', 'psc')
        .leftJoinAndSelect('psc.category', 'subSubCategory')
        .leftJoinAndSelect('psc.size', 'size')
        .where('product.name ILIKE :searchQuery', {
          searchQuery: `%${searchQuery}%`,
        }) // Case-insensitive search
        .getMany();

      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // get product by query
  async getLessProductByQuery(searchQuery: string) {
    try {
      const products = await this.productRepo
        .createQueryBuilder('product')
        .where('product.name ILIKE :searchQuery', {
          searchQuery: `%${searchQuery}%`,
        }) // Case-insensitive search
        .limit(3)
        .getMany();

      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // view all buying histories
  async getAllBuyingHistories(email: string) {
    if (email) {
      // console.log('in');
      const user = await this.getUserByEmail(email);
      // console.log('user',user,'user');
      const cartsWithHistory = await this.cartRepo.find({
        where: {
          ...(user.role != 'admin' && { customer: { email: email } }),
          // isBought: true || false
          isBought: true,
        },
        relations: [
          'history',
          'history.deliveryStatus',
          'history.paymentMethod',
          'customer',
          'product',
          'category',
          'category.category',
          'category.category.category',
        ],
      });

      // console.log(cartsWithHistory);
      return cartsWithHistory;
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  // view all users / customers info
  async getAllUsers() {
    return this.userRepo.find();
  }

  // view all roles
  async getAllRoles() {
    return this.roleRepo.find();
  }

  // get history by id
  async getBuyingHistoryByToken(token: string, email: string) {
    if (email) {
      // console.log('in');
      const user = await this.getUserByEmail(email);
      // console.log('user',user,'user');
      const cartsWithHistory = await this.cartRepo.find({
        where: {
          ...(user?.role != 'admin' && { customer: { email: email } }),
          // isBought: true || false
          history: { trackingToken: token },
        },
        relations: [
          'history',
          'history.deliveryStatus',
          'history.paymentMethod',
          'customer',
          'product',
          'category',
          'category.category',
          'category.category.category',
        ],
      });

      // console.log(cartsWithHistory);
      return cartsWithHistory;
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  async getBuyingHistoryStatusByToken(token: string) {
    // console.log(token);
    const query = {
      where: { trackingToken: token },
      relations: ['deliveryStatus', 'paymentMethod'],
    };

    try {
      const cartsWithHistory = await this.buyingHistoryRepo.findOne(query);
      return cartsWithHistory;
    } catch (error) {
      // Handle error logging or other error handling mechanisms
      console.error(`Error fetching buying history: ${error}`);
      throw error;
    }
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
    return coupon;
  }

  // disable coupon
  async disableCoupon(id) {
    const coupon = await this.getParticularCoupon(id);
    coupon.isEnable = false;
    await this.couponRepo.save(coupon);
  }

  // disable sub category
  async disableSubSubCategory(id: number) {
    const category = await this.subCategoryRepo.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Sub-category not found');
    }

    category.isDisabled
      ? (category.isDisabled = false)
      : (category.isDisabled = true);
    return this.subCategoryRepo.save(category);
  }

  // view all carts
  async getAllCarts(email: string) {
    if (!email) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const user = await this.userRepo.findOneBy({ email });
    const isAdmin = user?.role == 'admin';

    // console.log(isAdmin);

    // const allCarts = await this.cartRepo.find()
    // console.log('allCarts',allCarts,'allCarts');

    const cartsWithHistory = await this.cartRepo.find({
      where: { ...(isAdmin ? {} : { customer: { email } }) },
      relations: [
        'product',
        'coupon',
        'category',
        'category.category',
        'category.category.category',
      ],
    });

    // console.log('cartsWithHistory',cartsWithHistory,'cartsWithHistory');

    // console.log(cartsWithHistory, "259");
    return cartsWithHistory;
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

  // view popular items
  async viewPopularItems() {
    return await this.productRepo.find({
      order: { salesCount: 'DESC' },
      relations: ['productPictures', 'pscs', 'pscs.category', 'pscs.size'],
      take: 12,
    });
  }

  // view new arrivals
  async viewNewArrivals() {
    const options: FindManyOptions<NewArrivalEntity> = {
      relations: ['subsub'], // Ensure this matches your entity relation
    };
    const arrivals = await this.newArrivalRepo.find(options);
    return arrivals;
  }

  // view active pop up
  async viewActivePopUp() {
    const activePop = await this.activePopRepo.find({
      take: 1,
      relations: ['popup'],
    });

    // console.log(activePop, 'acc');
    return activePop.length > 0 && activePop[0]?.popup;
  }

  // view all pop up
  async viewAllPopUp() {
    const options: FindManyOptions<PopUpEntity> = {};

    const popUps = await this.popUpRepo.find(options);
    return popUps;
  }

  // view genders
  async viewGenders() {
    const options: FindManyOptions<GenderEntity> = {};
    const genders = await this.genderRepo.find(options);
    return genders;
  }

  // view cancellation or return requests
  async viewRequests(email: string) {
    // Fetch the user by email
    const user = await this.userRepo.findOne({ where: { email } });

    // Check if the user exists and if the role is admin
    if (!user || user.role !== 'admin') {
      throw new UnauthorizedException('Unauthorized: User is not an admin');
    }

    // If the user is an admin, fetch the requests
    const options: FindManyOptions<ReturnEntity> = {
      relations: ['cart', 'cart.customer', 'cart.history'],
    };
    const requests = await this.returnRepo.find(options);
    return requests;
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
    const subCats = await this.subCategoryRepo.find({
      where: { category: { id: id } },
    });
    return subCats;
  }

  // view product sub sub-category
  async viewProductSubSubCategories(id: number) {
    const subCats = await this.subSubCategoryRepo.find({
      where: { category: { id: id } },
    });
    return subCats;
  }

  // view product size
  async viewProductSizes() {
    const options: FindManyOptions<SizeEntity> = {};
    const sizes = await this.sizeRepo.find(options);
    return sizes;
  }

  // view all views
  async viewAllProductsViews() {
    const options: FindManyOptions<ViewProductEntity> = {};
    const views = await this.viewRepo.find(options);
    return views;
  }

  // sync view count
  async syncViewCount() {
    try {
      // Step 1: Fetch all products
      const products = await this.productRepo.find();

      // Step 2: Iterate through products and calculate total views
      for (const product of products) {
        const { id: productId } = product;

        // Aggregate total views from the view_product table
        const result = await this.viewRepo
          .createQueryBuilder('view_product')
          .select('SUM(view_product.count)', 'totalViews')
          .where('view_product.productId = :productId', { productId })
          .getRawOne();

        const totalViews = parseInt(result.totalViews || 0, 10);

        // Update the product's totalViews field
        return await this.productRepo.update(productId, { totalViews });
      }

      console.log('View counts synced successfully');
    } catch (error) {
      console.error('Error syncing view counts:', error.message);
      throw error;
    }
  }

  // sync sales count
  async syncSalesCount() {
    try {
      // Step 1: Get all bought carts
      const carts = await this.cartRepo.find({
        where: { isBought: true },
        relations: ['product'],
      });

      // Step 2: Count how many times each product appears
      const productCountMap: Record<number, number> = {};

      for (const cart of carts) {
        const productId = cart.product.id;
        console.log(productId);
        productCountMap[productId] = (productCountMap[productId] || 0) + 1;
      }

      // Step 3: Update salesCount for each product
      for (const [productIdStr, count] of Object.entries(productCountMap)) {
        // console.log(count);
        const productId = parseInt(productIdStr, 10);
        await this.productRepo.update(productId, { salesCount: count });
      }

      return carts;
    } catch (error) {
      console.error('Error syncing sales counts:', error.message);
      throw error;
    }
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
  async checkIfWished(productId, customerEmail) {
    console.log(productId, customerEmail, 'okk');

    // const getAllWish = await this.wishRepo.find(
    //   {
    //     relations: [
    //       'product',
    //       'customer'
    //     ]
    //   }
    // )

    // console.log(getAllWish,'getAllWish');

    const wished = await this.wishRepo.findOne({
      where: { product: { id: productId }, customer: { email: customerEmail } },
    });

    // console.log(wished,'wished');

    return { isWished: wished ? true : false, wished };
  }

  // get featured image by product id
  async getProductFtImage(productId) {
    const result = await this.productPicRepo.findOne({
      where: { isThumbnail: true, product: { id: productId } },
      // relations: ['color'],
    });
    return result;
  }

  // get category by id
  async getBannerById(id) {
    return await this.bannerRepo.findOneBy({ id });
  }

  // get size by id
  async getSizeById(id) {
    return await this.sizeRepo.findOneBy({ id });
  }

  // get size by name
  async getSizeByName(name: string) {
    return await this.sizeRepo.findOneBy({ name });
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

  // get Product by category id
  async getProductByCat(name) {
    //get all the products where category name == name
    const products = await this.productRepo.find({
      where: {
        pscs: { category: { category: { category: { name } } } },
        publishable: true,
      },
      relations: [
        'color',
        'fabric',
        'productPictures',
        'pscs',
        'pscs.category',
        'pscs.category.category.category',
        'pscs.size',
      ],
    });

    // console.log(products);
    return products;
  }

  // get publishabe products
  async getPublishableProductsBySubSubCatId(subCategoryId) {
    try {
      const products = await this.getProductBySubSubCatId(subCategoryId);
      const publishableProducts = products.filter(
        (product) => product.publishable,
      );

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
  async getProductById(id) {
    // console.log(id, 'id');
    return await this.productRepo.findOne({
      where: { id: id },
      relations: [
        'color',
        'fabric',
        'productPictures',
        'pscs',
        'pscs.category',
        'pscs.category.category.category',
        'pscs.size',
      ],
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

  // update sub category by id
  async updateSubCategory(id: number, category) {
    const user = await this.subCategoryRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    await this.subCategoryRepo.update(id, { ...category });
  }

  // update product type name
  async updateProductTypeName(id: number, myDto: { name: string }) {
    const existing = await this.subSubCategoryRepo.findOne({
      where: { id: Number(id) },
    });

    if (!existing) {
      throw new NotFoundException(`Product type with ID ${id} not found`);
    }

    return this.subSubCategoryRepo.update(
      { id: Number(id) },
      { name: myDto.name },
    );
  }

  // update category by id
  async updateActivePop(id: number) {
    // 1. Find the popup you want to make active
    const popup = await this.popUpRepo.findOneBy({ id });
    if (!popup) {
      throw new NotFoundException(`Popup with ID ${id} not found.`);
    }

    popup.isActive = true;
    await this.popUpRepo.save(popup);

    // 2. Get the current active popup (first record)
    const [activePop] = await this.activePopRepo.find({
      take: 1,
      relations: ['popup'], // This ensures the related PopUpEntity is loaded
    });

    if (!activePop) {
      // If no active popup exists, create one
      const newActivePop = this.activePopRepo.create({ popup });
      return await this.activePopRepo.save(newActivePop);
    }

    activePop.popup.isActive = false;
    await this.popUpRepo.save(activePop.popup);

    // 3. Update the relationship (not the properties)
    activePop.popup = popup;
    return await this.activePopRepo.save(activePop);
  }

  // update sub sub category by id
  async updateSubSubCategory(id: number, filename: string) {
    const res = await this.subSubCategoryRepo.update(id, { filename });

    // console.log(res);

    return res;
  }

  // update user address
  async updateUserAddress(userId: number, updateAddressDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    user.name = updateAddressDto?.name || user.name;
    user.city = updateAddressDto?.city || user.city;
    user.region = updateAddressDto?.region || user.region;
    // user.postal_code = updateAddressDto?.postal_code
    user.address = updateAddressDto?.address || user.address;
    user.mbl_no = updateAddressDto?.mbl_no || user.mbl_no;

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
  async updateBuyingHistory(token: string, updates: any, email: string) {
    // console.log(updates);
    const user = await this.userRepo.findOneBy({ email });

    if (!user) {
      throw new NotFoundException(`User not found.`);
    }

    if (user.role != 'admin') {
      throw new ForbiddenException(`Only admins can update buying history.`);
    }

    const history = await this.buyingHistoryRepo.findOneBy({
      trackingToken: token,
    });

    if (!history) {
      throw new NotFoundException(`Buying history not found.`);
    }

    // Update any column in the buying history
    Object.assign(history, updates);

    const result = await this.buyingHistoryRepo.save(history);
    return result;
  }

  // update role by id
  async updateRoleById(id: number, dto) {
    try {
      const role = await this.roleRepo.findOne({ where: { id } });

      if (!role) {
        throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
      }

      // Check for duplicate role name
      const existing = await this.roleRepo.findOne({
        where: { name: dto.name.toLowerCase() },
      });
      if (existing && existing.id !== role.id) {
        throw new HttpException(
          'Role name already in use',
          HttpStatus.CONFLICT,
        );
      }

      role.name = dto.name.toLowerCase();
      await this.roleRepo.save(role);

      return {
        status: HttpStatus.OK,
        message: 'Role updated successfully',
        data: role,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update role',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // approve req
  async updateApproveReq(id: number) {
    // Find the entity by id
    const entity = await this.returnRepo.findOne({
      where: { id },
      relations: ['cart'],
    });

    // console.log(entity);

    if (!entity) {
      throw new Error(`Entity with id ${id} not found`);
    }

    entity.cart.Quantity > 0 && entity.cart.Quantity--;

    // Update the isApproved field to true
    entity.isApproved = true;

    await this.cartRepo.save(entity.cart);
    // Save the updated entity back to the database
    const res = await this.returnRepo.save(entity);

    console.log(`Entity with id ${id} updated to isApproved: true`);

    return res;
  }

  // update product
  async updateProduct(id: number, updateProductDto: any, filename: any) {
    const productObj = await this.productRepo.findOne({
      where: { id },
      relations: ['pscs', 'pscs.size', 'pscs.category'],
    });

    if (!productObj) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    // ✅ Update color
    if (updateProductDto.colorCode) {
      const color = await this.colorRepo.findOne({
        where: { colorCode: updateProductDto.colorCode },
      });
      productObj.color = color;
    }

    updateProductDto.ifStock == 'true'
      ? (updateProductDto.ifStock = true)
      : (updateProductDto.ifStock = false);

    Object.assign(productObj, updateProductDto);

    // ✅ If new file is uploaded
    if (filename) {
      // Delete old image and thumbnail if exist
      const oldImagePath = productObj.filename
        ? path.join('uploads', productObj.filename)
        : null;
      const oldThumbPath = productObj.thumbImage
        ? path.join('uploads', productObj.thumbImage)
        : null;

      if (oldImagePath && fs.existsSync(oldImagePath)) {
        await unlinkAsync(oldImagePath);
      }

      if (oldThumbPath && fs.existsSync(oldThumbPath)) {
        await unlinkAsync(oldThumbPath);
      }

      productObj.filename = filename.filename;

      // add thumb image
      productObj.thumbImage = await this.compressImage(
        filename.filename,
        'thumb',
      );
    }

    const savedProduct = await this.productRepo.save(productObj);

    // ✅ Category/size update
    const catsInfoArray = JSON.parse(updateProductDto.catsInfo);

    const processedCatsInfo = [];
    let previousCategory = null;

    catsInfoArray.forEach((item) => {
      if (!Array.isArray(item)) {
        previousCategory = { categoryId: item, sizes: [] };
        processedCatsInfo.push(previousCategory);
      } else {
        const size = { sizeId: item[0], quantity: item[1] || 0 };
        previousCategory.sizes.push(size);
      }
    });

    await this.productSizeCategoryRepo.delete({ product: productObj });

    for (const item of processedCatsInfo) {
      const catInfoItem = new ProductSizeCategoryEntity();
      catInfoItem.product = productObj;
      catInfoItem.category = await this.subSubCategoryRepo.findOne({
        where: { id: item.categoryId },
      });

      if (item.sizes.length <= 0) {
        await this.productSizeCategoryRepo.save(catInfoItem);
      } else {
        for (const sizeItem of item.sizes) {
          const sizeObject = sizeItem.sizeId
            ? await this.getSizeById(sizeItem.sizeId)
            : null;

          const newCatInfoItem = new ProductSizeCategoryEntity();
          newCatInfoItem.product = productObj;
          newCatInfoItem.category = catInfoItem.category;
          newCatInfoItem.size = sizeObject;
          newCatInfoItem.quantity = sizeItem.quantity;

          await this.productSizeCategoryRepo.save(newCatInfoItem);
        }
      }
    }

    return savedProduct;
  }

  // shuffle category serial
  async shuffleCategorySerial(categoryDto: { id: number; serial: number }[]) {
    const updatePromises = categoryDto.map(async (cat) => {
      await this.categoryRepo.update(cat.id, { serial: cat.serial });
    });

    await Promise.all(updatePromises);
    return { message: 'Category serials updated successfully' };
  }

  // update buying history / order status
  async updateBuyingHistoryStatusByToken(
    token: string,
    updates: any,
    email: string,
  ) {
    // console.log(updates);
    const user = await this.userRepo.findOneBy({ email });

    if (!user) {
      throw new NotFoundException(`User not found.`);
    }

    if (user.role != 'admin') {
      throw new ForbiddenException(`Only admins can update buying history.`);
    }

    const history = await this.buyingHistoryRepo.findOne({
      where: { trackingToken: token },
      relations: ['deliveryStatus'],
    });

    if (!history) {
      throw new NotFoundException(`Buying history not found.`);
    }

    if (!updates.cancelDate && !updates.returnDate) {
      history.deliveryStatus.id += 1;
    } else if (updates.cancelDate) {
      history.deliveryStatus.id = 7;
    } else if (updates.returnDate) {
      history.deliveryStatus.id = 8;
    }

    // Update any column in the buying history
    Object.assign(history, updates);

    const result = await this.buyingHistoryRepo.save(history);
    return result;
  }

  // delete product by id
  async deleteProductById(id: number, email: string) {
    try {
      const user = await this.getUserByEmail(email);

      if (user && user.role == 'admin') {
        await this.viewRepo.delete({ product: { id } });

        await this.wishRepo.delete({ product: { id } });

        await this.cartRepo.delete({ product: { id } });

        await this.productPicRepo.delete({ product: { id } });

        await this.productSizeCategoryRepo.delete({ product: { id } });

        const deleted = await this.productRepo.delete(id);

        return deleted;
      } else {
        throw new UnauthorizedException(
          'You are not authorized to delete product',
        );
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }

  // delete role by id
  async deleteRoleById(id: number) {
    try {
      const role = await this.roleRepo.findOne({ where: { id } });

      if (!role) {
        throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
      }

      // Optional: check if any users are assigned this role
      // const usersWithRole = await this.userRepo.count({ where: { role: role.name } });
      // if (usersWithRole > 0) {
      //   throw new HttpException('Cannot delete role assigned to users', HttpStatus.CONFLICT);
      // }

      await this.roleRepo.remove(role);

      return { status: HttpStatus.OK, message: 'Role deleted successfully' };
    } catch (error) {
      console.error('Error deleting role:', error);
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // delete product type by id
  async deleteProductTypeById(id: number) {
    try {
      const productType = await this.subSubCategoryRepo.findOneBy({ id });
      // console.log(productType);

      if (!productType) {
        throw new NotFoundException(`Product type with ID ${id} not found.`);
      }

      const deleted = this.subSubCategoryRepo.delete(productType.id);
      console.log(deleted);

      return deleted;
    } catch (error) {
      console.error('Error deleting product type:', error);
    }
  }

  // delete category by id
  async deleteCategoryById(id: number) {
    try {
      const cat = await this.categoryRepo.findOneBy({ id });
      // console.log(cat);

      if (!cat) {
        throw new NotFoundException(`Category with ID ${id} not found.`);
      }

      const deleted = this.categoryRepo.delete(cat.id);
      console.log(deleted);

      return deleted;
    } catch (error) {
      console.error('Error deleting product type:', error);
    }
  }

  // delete sub category type by id
  async deleteSubCategoryById(id: number) {
    try {
      const cat = await this.subCategoryRepo.findOneBy({ id });
      // console.log(cat);

      if (!cat) {
        throw new NotFoundException(`Category with ID ${id} not found.`);
      }

      const deleted = this.subCategoryRepo.delete(cat.id);
      console.log(deleted);

      return deleted;
    } catch (error) {
      console.error('Error deleting sub category:', error);
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
  async removeWish(wishId) {
    console.log('myData', wishId);
    try {
      const wish = await this.wishRepo.findOne({ where: { id: wishId } });

      // console.log('wishesss', wish);

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
  async createNewCategory(myDto) {
    // Step 1: Create and save to get the generated ID
    const savedCategory = await this.categoryRepo.save({
      ...myDto,
      serial: 0, // temp value
    });

    // Step 2: Now set serial = id and save again
    savedCategory.serial = savedCategory.id;
    return this.categoryRepo.save(savedCategory);
  }

  // create new category
  async createPaymentMethod(myDto) {
    const newPaymentMethod = this.paymentMethodRepo.create({ ...myDto });
    return this.paymentMethodRepo.save(newPaymentMethod);
  }

  // increase product view
  async increaseProductView(productId: number, email: string) {
    let customer = await this.getUserByEmail(email);

    if (!customer) {
      customer = await this.userRepo.save({ email: email });
    }

    // Find the existing view record for the user and product
    const existingView = await this.viewRepo.findOne({
      where: { product: { id: productId }, user: { id: customer.id } },
    });

    // Update or create the view record
    if (existingView) {
      existingView.count += 1;
      await this.viewRepo.save(existingView);
    } else {
      const newView = this.viewRepo.create({
        product: { id: productId },
        user: { id: customer.id },
        count: 1,
      });
      await this.viewRepo.save(newView);
    }

    // Update the total views for the product
    await this.updateProductTotalViews(productId);
  }

  // update product views
  private async updateProductTotalViews(productId: number) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Increment the total views count
    product.totalViews += 1;

    // Save the updated product
    return await this.productRepo.save(product);
  }

  // create new coupon
  async createNewCoupon(myDto) {
    const newCoupon = this.couponRepo.create({ ...myDto });
    return this.couponRepo.save(newCoupon);
  }

  // create new color
  async createNewColor(myDto) {
    const newColor = this.colorRepo.create({ ...myDto });
    return this.colorRepo.save(newColor);
  }

  // create new sub-category
  async createNewSubCategory(myDto) {
    const category = await this.getCategoryByName(myDto.categoryName);
    myDto.category = category;
    const newCategory = this.subCategoryRepo.create({ ...myDto });
    return this.subCategoryRepo.save(newCategory);
  }

  // create new sub-sub-category
  async createNewSubSubCategory(myDto) {
    const category = await this.getSubCategoryById(myDto.categoryId);
    // console.log(category, 583);
    myDto.category = category;
    const newCategory = this.subSubCategoryRepo.create({ ...myDto });
    return this.subSubCategoryRepo.save(newCategory);
  }

  // Confirm or cancel order
  async confirmReturnOrCancellation(selectedProducts, reason: string) {
    // console.log(selectedProducts);
    const createdReturns = [];

    for (const product of selectedProducts) {
      const cart = await this.cartRepo.findOne({
        where: { id: product.cartId },
      });
      // console.log(cart);

      if (cart) {
        const returnEntity = new ReturnEntity();
        returnEntity.cart = cart;
        returnEntity.reason = reason;
        returnEntity.quantity = product.quantity;
        returnEntity.isApproved = false; // Default to false, can update after approval logic
        // Add additional fields if necessary

        const savedReturn = await this.returnRepo.save(returnEntity);
        createdReturns.push(savedReturn);
      }
    }

    console.log(`Return or cancellation confirmed for reason: ${reason}`);
    return {
      success: true,
      createdReturns,
      message: 'Return or cancellation has been processed',
    };
  }

  // create new size
  async createNewSize(myDto) {
    const newSize = this.sizeRepo.create({ ...myDto });
    return this.sizeRepo.save(newSize);
  }

  // create new fabric
  async createNewFabric(myDto) {
    const newFabric = this.fabricRepo.create({ ...myDto });
    return this.fabricRepo.save(newFabric);
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
        return newCustomer;
      }

      return true;
    } catch (error) {
      // Handle authentication errors
      throw new Error('Authentication failed');
    }
  }

  // create new buy
  async createNewBuy(myDto) {
    // console.log(myDto, "544");

    myDto.deliveryStatus = await this.getDeliveryStatusById(
      myDto?.deliveryStatusId || 1,
    );
    myDto.paymentMethod = await this.getPaymentMethodById(
      myDto?.paymentMethodId || 1,
    );
    myDto.trackingToken = uuidv4();
    const newBuy = this.buyingHistoryRepo.create({ ...myDto });

    // console.log(myDto,844);
    const savedBuy = await this.buyingHistoryRepo.save(newBuy);
    // console.log(myDto.carts, 'carts');
    this.createNewCartObject(savedBuy, myDto.carts);
    return savedBuy;
  }

  // send message to customer
  async sendMessageToCustomer(myDto) {
    myDto.deliveryStatus = await this.getDeliveryStatusById(
      myDto?.deliveryStatusId || 1,
    );
    myDto.paymentMethod = await this.getPaymentMethodById(
      myDto?.paymentMethodId || 1,
    );
    myDto.trackingToken = uuidv4();
    const newBuy = this.buyingHistoryRepo.create({ ...myDto });

    // console.log(myDto,844);
    const savedBuy = await this.buyingHistoryRepo.save(newBuy);
    // console.log(myDto.carts, 'carts');
    return savedBuy;
  }

  // send customization request
  async handleDesignRequest(designData: any) {
    const userInfo = await this.getUserByEmail(designData.email);

    // Map the designData to a CustomizationRequest entity
    const customizationRequest = this.customReqRepo.create({
      size: designData?.size,
      quantity: designData?.quantity,
      color: designData.color,
      side: designData.side || 'front',
      specialInstructions: designData.specialInstructions || 0,
      // elements: designData.elements,
      previewImage: designData.previewImage,
      phone: designData.phone,
      name: designData.name,
      address: designData.address,
      user: userInfo,
    });

    // Save the request to the database
    const res = await this.customReqRepo.save(customizationRequest);
    return res;
    // You can add additional business logic here, like sending an email or notification
  }

  // custom text store
  async handleCustomTextElement(element, id: number) {
    try {
      const obj = await this.customReqRepo.findOne({
        where: {
          id: id,
        },
      });

      if (!obj) {
        throw new NotFoundException('object not found');
      }

      const newTextObj = new CustomTextElement();
      newTextObj.customReq = obj;
      newTextObj.fontFamily = element.style.fontFamily;
      newTextObj.color = element.style.color;
      newTextObj.fontWeight = element.style.fontWeight;
      newTextObj.fontSize = element.style.fontSize;
      newTextObj.content = element.content;
      newTextObj.width = element.width;
      newTextObj.height = element.height;
      newTextObj.x = element.x;
      newTextObj.y = element.y;
      newTextObj.rotation = parseInt(element.style.rotation, 10); // Ensure y is an integer

      // console.log(customer, 'cust', product);
      const newTextElement = this.customTextRepo.create(newTextObj);

      return await this.customTextRepo.save(newTextElement);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create new text');
    }
  }

  // custom text store
  async handleCustomImageElement(element, id: number) {
    try {
      const obj = await this.customReqRepo.findOne({
        where: {
          id: id,
        },
      });

      if (!obj) {
        throw new NotFoundException('object not found');
      }

      // Parse numeric values
      element.height = parseInt(element.height, 10); // Ensure height is an integer
      element.width = parseInt(element.width); // Ensure width is a float (if necessary)
      element.originalHeight = parseInt(element.originalHeight, 10); // Ensure originalHeight is an integer
      element.originalWidth = parseInt(element.originalWidth, 10); // Ensure originalWidth is an integer
      element.x = parseInt(element.x, 10); // Ensure x is an integer
      element.y = parseInt(element.y, 10); // Ensure y is an integer
      element.rotation = parseInt(element.rotation, 10); // Ensure y is an integer

      element.customReq = obj;

      const newImgElement = this.customImgRepo.create(element);

      return await this.customImgRepo.save(newImgElement);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create new image');
    }
  }

  // get all customization requests
  async getAllCustomizationRequests(email: string, id: number) {
    console.log(id);
    const userInfo = await this.getUserByEmail(email);
    // console.log(userInfo);
    const isAdmin = userInfo.role == 'admin';
    const relations = ['user', 'customTexts', 'customImages'];

    // console.log(email,id,'===id');
    if (isAdmin) {
      // admin: get all
      if (id == 0) return this.customReqRepo.find({ relations });
      // console.log(id);
      return this.customReqRepo.findOne({
        where: {
          id: id,
        },
        relations,
      });
    } else {
      // normal user: only get their own
      if (id == 0)
        return this.customReqRepo.find({
          where: { user: { email } },
          relations,
        });

      return this.customReqRepo.findOne({
        where: { user: { email }, id: id },
        relations,
      });
    }
  }

  // create new cart object
  async createNewCartObject(buy, cartsData) {
    // console.log(buy, 'buy', cartsData, 'cartsData');
    for (const cartDataId of cartsData) {
      const cart = await this.cartRepo.findOne({
        where: { id: cartDataId },
        relations: ['product', 'category'],
      });

      if (!cart) {
        console.error(`Cart not found for ID: ${cartDataId}`);
        continue;
      }

      const size = await this.getSizeByName(cart.size);
      if (!size) {
        console.error(`Size not found for size name: ${cart.size}`);
        continue;
      }

      const pscObj = await this.productSizeCategoryRepo.findOne({
        where: {
          category: cart.category,
          size: size,
          product: { id: cart.product.id },
        },
        relations: ['product'],
      });

      if (pscObj) {
        if (pscObj.quantity) {
          pscObj.quantity -= cart.Quantity;
        }
        await this.productSizeCategoryRepo.save(pscObj);
      } else {
        console.error(
          `Product-Size-Category object not found for Cart ID: ${cartDataId}`,
        );
      }

      cart.isBought = true;
      cart.totalPrice = Math.ceil(
        (cart.product.sellingPrice -
          (cart.product.sellingPrice * cart.product.discountPercentage) / 100 +
          (cart.product.sellingPrice * cart.product.vatPercentage) / 100) *
          cart.Quantity,
      );
      cart.history = buy;
      await this.cartRepo.save(cart);
    }
    return true;
  }

  // create new cart
  async createNewCart(myDto) {
    // console.log(myDto);
    const selectedProduct = await this.getProductById(myDto.productId);
    // console.log(selectedProduct,'krr');
    myDto.product = selectedProduct;
    myDto.uniqueId = uuidv4();
    myDto.category =
      myDto?.category && (await this.getSubSubCategoryById(myDto.category));

    // Check if customer exists, create one if not
    if (myDto?.customerEmail) {
      let customer = await this.getUserByEmail(myDto.customerEmail);
      if (!customer) {
        // Create a new customer if not found
        customer = await this.userRepo.save({ email: myDto.customerEmail });
      }
      myDto.customer = customer;
    } else {
      myDto.customer = null; // Explicitly set to null if no email is provided
    }

    myDto.coupon =
      myDto?.couponId && (await this.getCouponById(myDto?.couponId));
    const selectedColor = await this.getColorById(myDto.colorId);
    myDto.ProductName = selectedColor.name + ' ' + selectedProduct.name;
    const newCart = this.cartRepo.create({ ...myDto });

    const savedProduct = await this.cartRepo.save(newCart);
    return savedProduct;
  }

  // create new wish
  async createNewWish(myDto) {
    // console.log('myDto', myDto);
    if (!myDto.productId || !myDto.customerEmail) {
      // console.log("object");
      throw new BadRequestException(
        'Product ID and customer email are required',
      );
    }

    try {
      const product = await this.getProductById(myDto.productId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      let customer = await this.getUserByEmail(myDto.customerEmail);
      if (!customer) {
        customer = await this.userRepo.save({ email: myDto.customerEmail });
      }

      // console.log(customer, 'cust', product);
      const newWish = this.wishRepo.create({ product, customer });

      return await this.wishRepo.save(newWish);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create new wish');
    }
  }

  // get all wishlist of a customer
  getWishByUser(email: string) {
    return this.wishRepo.find({
      where: { customer: { email: email } },
      relations: ['product', 'customer'],
    });
  }

  // get all product product ids
  async generateProductIds() {
    const allProducts = await this.viewAllProducts({
      publishable: true,
    });

    for (const pd of allProducts) {
      if (pd.productId != null || pd.productId != '') return;

      console.log(pd.id);

      const slug = pd.name
        .toLowerCase()
        .replace(/\s+/g, '-') // replace spaces with dashes
        .replace(/[^a-z0-9\-]/g, ''); // remove special chars

      pd.productId = `${slug}-${pd.id}`;

      // update each product
      await this.productRepo.update(pd.id, { productId: pd.productId });
    }

    return {
      message: `Updated ${allProducts.length} products with productIds.`,
    };
  }

  // create new product
  async createNewProduct(myDto) {
    // console.log('md', myDto, 'md');
    const selectedColor = await this.getColorByName(myDto.color);
    myDto.color = selectedColor;
    myDto.ifStock = false;

    const catsInfoArray = JSON.parse(myDto.catsInfo);

    catsInfoArray.forEach((item) => {
      if (Array.isArray(item)) {
        if (parseInt(item[1]) > 0) {
          myDto.ifStock = true;
        }
      }
    });

    // add thumb image
    myDto.thumbImage = await this.compressImage(myDto.filename, 'thumb');

    // console.log(myDto, 'msdkn');

    const lastProduct = await this.productRepo.find({
      order: { id: 'DESC' },
      take: 1,
    });

    const slug = myDto.name
      .toLowerCase()
      .replace(/\s+/g, '-') // replace spaces with dashes
      .replace(/[^a-z0-9\-]/g, ''); // remove special chars

    // if no products exist yet, start from 1
    const nextId = lastProduct.length === 1 ? lastProduct[0].id + 1 : 1;

    myDto.productId = `${slug}-${nextId}`;

    const newProduct = this.productRepo.create({ ...myDto });
    const savedProduct = await this.productRepo.save(newProduct);

    // console.log(savedProduct, 'ss');
    // console.log(savedProduct.name,'nn');

    return await this.createProductExtension(savedProduct, myDto.catsInfo);
  }

  // create product extension
  async createProductExtension(product, catsInfo) {
    const catsInfoArray = JSON.parse(catsInfo);

    const processedCatsInfo = [];
    let previousCategory = null;

    catsInfoArray.forEach((item) => {
      if (!Array.isArray(item)) {
        previousCategory = { categoryId: item, sizes: [] };
        processedCatsInfo.push(previousCategory);
      } else {
        const size = { sizeId: item[0], quantity: item[1] || 0 };
        previousCategory.sizes.push(size);
      }
    });

    // console.log(JSON.stringify(processedCatsInfo, null, 2));

    for (const item of processedCatsInfo) {
      const catInfoItem = new ProductSizeCategoryEntity();

      catInfoItem.product = product;
      catInfoItem.category = await this.subSubCategoryRepo.findOne({
        where: { id: item.categoryId },
      });

      if (item.sizes.length <= 0) {
        await this.productSizeCategoryRepo.save(catInfoItem);
      } else {
        for (const sizeItem of item.sizes) {
          const sizeObject = sizeItem.sizeId
            ? await this.getSizeById(sizeItem.sizeId)
            : null;

          const newCatInfoItem = { ...catInfoItem }; // Create a new instance
          newCatInfoItem.size = sizeObject;
          newCatInfoItem.quantity = sizeItem.quantity;

          await this.productSizeCategoryRepo.save(newCatInfoItem);
        }
      }
    }

    // console.log(processedCatsInfo, 771);

    return product;
  }

  // compress image
  async compressImage2(inputPath: string, outputPath: string) {
    try {
      const thumbDir = path.dirname(outputPath);
      if (!fs.existsSync(thumbDir)) {
        fs.mkdirSync(thumbDir, { recursive: true });
      }

      // Convert to absolute paths
      const absInputPath = path.resolve(inputPath);
      const absOutputPath = path.resolve(outputPath);

      await sharp(absInputPath)
        .resize({
          width: 800,
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(absOutputPath);

      console.log(`✅ Compressed image saved at: ${absOutputPath}`);
    } catch (err) {
      console.error(
        `❌ Failed to compress image for ${inputPath}:`,
        err.message,
      );
      throw err;
    }
  }

  // update discount
  async updateDiscount(myDto: {
    categoryIds: number[];
    discountPercentage: number;
  }) {
    const { categoryIds, discountPercentage } = myDto;

    const products = await this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.pscs', 'psc')
      .leftJoin('psc.category', 'category')
      .where('category.id IN (:...categoryIds)', { categoryIds })
      .select('product.id')
      .getMany();

    const productIds = products.map((p) => p.id);

    if (productIds.length === 0) {
      return { message: 'No products found in the given categories.' };
    }

    const result = await this.productRepo
      .createQueryBuilder()
      .update()
      .set({ discountPercentage })
      .whereInIds(productIds)
      .execute();

    return {
      message: 'Updated discount successfully',
      updatedCount: result.affected,
    };
  }

  // create new arrivals
  async addNewArrivals(myDto) {
    const cat = await this.subSubCategoryRepo.findOne({
      where: { id: parseInt(myDto.category) },
    });

    myDto.subsub = cat;
    // Check if a product with the same serial already exists
    const existingProduct = await this.newArrivalRepo.findOne({
      where: { serial: myDto.serial },
    });

    if (existingProduct) {
      // Delete the existing product
      await this.newArrivalRepo.delete(existingProduct.id);
    }

    // Create a new product
    const newArrival = this.newArrivalRepo.create(myDto);
    const savedProduct = await this.newArrivalRepo.save(newArrival);
    return savedProduct;
  }

  parseBDDate(dateStr: string): Date {
    const bdTime = new Date(dateStr);
    // add 6 hours
    bdTime.setHours(bdTime.getHours() + 6);
    return bdTime;
  }

  // create new pop up
  async addNewPopUp(myDto) {
    console.log(myDto, 'date dto');
    // Check for existing active popup
    const activePopups = await this.activePopRepo.find({
      order: { id: 'ASC' },
      relations: ['popup'],
    });

    const allPopUps = await this.popUpRepo.find();
    // 2025-06-26T17:13',
    //   endDate: '2025-06-30T17:24',
    console.log(allPopUps, 'allls');

    const existingActive = activePopups[0]; // first row, if any

    const now = new Date();

    const newPopUp = this.popUpRepo.create({
      filename: myDto.filename,
      title: myDto?.title || null,
      url: myDto?.url || null,
      isActive: existingActive
        ? existingActive?.popup?.endDate < now &&
          (myDto.isActive === 'true' || myDto.isActive === true)
        : myDto.isActive === 'true' || myDto.isActive === true,
      startDate: myDto.startDate ? this.parseBDDate(myDto.startDate) : null,
      endDate: myDto.endDate ? this.parseBDDate(myDto.endDate) : null,
    });

    const savedPopUp = await this.popUpRepo.save(newPopUp);

    if (existingActive) {
      const existingEndDate = existingActive.popup?.endDate;

      if (!existingEndDate || existingEndDate < now) {
        // expired, update
        await this.activePopRepo.update({ id: 1 }, { popup: savedPopUp });
      } else {
        // still valid, do not update
        console.log('Current active popup is still valid. No update done.');
      }
    } else {
      // No active popup row, create new one
      const newActive = this.activePopRepo.create({ popup: savedPopUp });
      await this.activePopRepo.save(newActive);
    }

    return savedPopUp;
  }

  // add product photos
  async addProductPictures(myDto: any) {
    const latestProduct = await this.productRepo.findOne({
      where: { id: MoreThan(1) },
      order: { id: 'DESC' },
    });

    if (!latestProduct) {
      throw new Error('No product found');
    }

    const filenames: string[] = myDto.filenames;
    const failed: any[] = []; // define failed array properly

    for (const filename of filenames) {
      const productPicture = new ProductPictureEntity();
      productPicture.filename = filename;
      productPicture.product = latestProduct;

      try {
        productPicture.thumb = await this.compressImage(filename, 'side-thumb');

        await this.productPicRepo.save(productPicture);
      } catch (err) {
        failed.push({
          productId: latestProduct.id,
          filename,
          reason: err.message || 'Unknown error',
        });
      }
    }

    return {
      success: filenames.length - failed.length,
      failed,
    };
  }

  // update product photos
  async updateProductPictures(myDto: any) {
    // Retrieve product by ID
    const product = await this.productRepo.findOne({ where: { id: myDto.id } });

    if (!product) {
      throw new Error('No product found');
    }

    // If new filenames are provided, delete existing pictures
    if (myDto.filenames.length > 0) {
      const oldPictures = await this.productPicRepo.find({
        where: { product },
      });

      console.log(oldPictures);

      for (const pic of oldPictures) {
        const oldImagePath = pic.filename
          ? path.join('uploads', pic.filename)
          : null;
        const oldThumbPath = pic.thumb ? path.join('uploads', pic.thumb) : null;
        if (oldImagePath && fs.existsSync(oldImagePath)) {
          await unlinkAsync(oldImagePath);
        }

        if (oldThumbPath && fs.existsSync(oldThumbPath)) {
          await unlinkAsync(oldThumbPath);
        }
      }

      await this.productPicRepo.delete({ product });
    }

    const filenames: string[] = myDto.filenames;
    const failed: any[] = [];

    for (const filename of filenames) {
      const productPicture = new ProductPictureEntity();
      productPicture.filename = filename;
      productPicture.product = product;

      try {
        const tempThumb = await this.compressImage(filename, 'side-thumb');
        productPicture.thumb = tempThumb;

        await this.productPicRepo.save(productPicture);
      } catch (err) {
        failed.push({
          productId: product.id,
          filename,
          reason: err.message || 'Unknown error',
        });
      }
    }

    return {
      success: filenames.length - failed.length,
      failed,
    };
  }

  async compressImage(filename, location) {
    try {
      const ext = path.extname(filename);
      const baseName = filename.replace(ext, '');
      const thumbFileName = `${baseName}.webp`;

      const inputPath = path.join('uploads', filename);
      const outputPath = path.join('uploads', location, thumbFileName);

      const thumbDir = path.dirname(outputPath);
      if (!fs.existsSync(thumbDir)) {
        fs.mkdirSync(thumbDir, { recursive: true });
      }

      // Convert to absolute paths
      const absInputPath = path.resolve(inputPath);
      const absOutputPath = path.resolve(outputPath);

      await sharp(absInputPath)
        .resize({
          width: 800,
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(absOutputPath);

      return path.join(location, thumbFileName);
    } catch (err) {
      console.error(`❌ Failed to compress image`, err.message);
      throw err;
    }
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

  // get all images compressed
  async getImagesCompressed() {
    const allProducts = await this.productRepo.find({
      relations: ['productPictures'],
    });

    let compressed = 0;
    let skipped = 0;
    const failed: { productId: number; reason: string }[] = [];

    for (const product of allProducts) {
      const sidePic = product.productPictures?.[0];

      if (!sidePic || !sidePic.filename || sidePic.thumb) {
        skipped++;
        continue;
      }

      try {
        // Save thumb path
        sidePic.thumb = await this.compressImage(
          sidePic.filename,
          'side-thumb',
        );
        await this.productPicRepo.save(sidePic);
        compressed++;
      } catch (err) {
        failed.push({
          productId: product.id,
          reason: err.message || 'Unknown error',
        });
      }
    }

    return {
      totalProducts: allProducts.length,
      compressedImages: compressed,
      skippedProducts: skipped,
      failedOperations: failed.length,
      failedDetails: failed,
      message: `Compression finished: ${compressed} compressed, ${skipped} skipped, ${failed.length} failed.`,
    };
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
