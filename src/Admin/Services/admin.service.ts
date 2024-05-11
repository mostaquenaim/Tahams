/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In } from 'typeorm';
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

    @InjectRepository(ColorSizeEntity)
    private colorSizeRepo: Repository<ColorSizeEntity>,
    // @InjectRepository(UserEntity)
    // private userRepo:Repository<UserEntity>,
  ) { }

  async addBanner(myDto) {
    return this.bannerRepo.save(myDto);
  }

  // add payment info 
  async addPaymentInfo(
    // token,
    myDto) {
    return this.paymentInfoRepo.save(myDto);
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

  // delete a cart item  
  async deleteCartItem(id) {
    const myData = await this.cartRepo.findOneBy({ uniqueId: id });
    if (myData) {
      return this.cartRepo.delete(myData);
    }
    throw new NotFoundException(`Banner with ID ${id} not found.`);;
  }

  // delete carts  
  async deleteCarts(cartArray: string[], email: string) {
    try {
      // Find all carts with unique IDs in the provided array
      const cartsToDelete = await this.cartRepo.find({ where: { uniqueId: In(cartArray), customer: { email: email } } });

      if (cartsToDelete.length > 0) {
        // Delete the found carts
        const deletionResult = await this.cartRepo.remove(cartsToDelete);
        return deletionResult;
      }

      throw new NotFoundException(`No carts found with the provided unique IDs.`);
    } catch (error) {
      throw new NotFoundException(`Error deleting carts: ${error.message}`);
    }
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

  // view all buying histories 
  async getAllBuyingHistories(email) {
    if (email) {
      const cartsWithHistory = await this.cartRepo.find({
        where: {
          customer: { email: email },
          history: { PaymentDone: true || false }
        },
        relations: ['history'], // Load the related buying histories
      });

      // Create a Set to store unique buying histories
      const uniqueHistories = new Set();

      cartsWithHistory.forEach((cart) => {
        if (cart.history) {
          uniqueHistories.add(cart.history);
        }
      });
      // Convert the Set to an array
      const buyingHistoriesArray = Array.from(uniqueHistories);
      return buyingHistoriesArray;
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
    console.log(email, "252");
    if (email) {
      const cartsWithHistory = await this.cartRepo.find({
        where: {
          customer: { email: email },
        },
        relations: ['product', 'coupon']
      });
      console.log(cartsWithHistory, "259");
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

  // view all product 
  async viewColors() {
    const options: FindManyOptions<ColorEntity> = {};
    const colors = await this.colorRepo.find(options);
    return colors;
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
    const options: FindManyOptions<SubCategoryEntity> = {};
    const subCategories = await this.subCategoryRepo.find(options);
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

  // get category by id 
  async getCategoryById(id) {
    return await this.categoryRepo.findOneBy({ id });
  }

  // get sub cat by id 
  async getSubSubCategoryById(id) {
    return await this.subSubCategoryRepo.findOneBy({ id });
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

  // ProductService
  async getProductById(id: number) {
    return await this.productRepo.findOne({
      where: { id },
      relations: ['color']
    });
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
    return await this.customerRepo.findOneBy({ id });
  }

  // get customer by email 
  async getCustomerByEmail(email) {
    return await this.customerRepo.findOneBy({ email: email });
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
  async getBuyingHistoryByToken(token) {
    return await this.buyingHistoryRepo.findOneBy({ trackingToken: token });
  }

  // get Product by category id 
  async getProductByCat(name) {
    //get all the products where category name == name
    // const products = await this.productRepo.find({
    //   where: {
    //     subCategories
    //   }
    // })
  }

  // get Product by sub sub category id 
  async getProductBySubSubCatId(subCategoryId) {
    try {
      const products = await this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.subCategories', 'subCategory')
        .leftJoinAndSelect('product.productPictures', 'productPicture')
        .leftJoinAndSelect('product.color', 'color') // Include color information
        .where('subCategory.id = :subCategoryId', { subCategoryId })
        .getMany();

      return products;
    } catch (error) {
      console.error('Error finding products:', error);
      throw error;
    }
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
    const category = await this.getCategoryById(myDto.categoryId)
    myDto.category = category
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

  // create new buy 
  async createNewBuy(myDto) {
    console.log(myDto, "544");

    myDto.deliveryStatus = await this.getDeliveryStatusById(myDto?.deliveryStatusId || 1)
    myDto.paymentMethod = await this.getPaymentMethodById(myDto?.paymentMethodId || 1)
    myDto.trackingToken = uuidv4();
    const newProduct = this.buyingHistoryRepo.create({
      ...myDto
    })

    const savedProduct = await this.buyingHistoryRepo.save(newProduct);
    this.createNewCartObject(savedProduct, myDto.carts)
    return savedProduct;
  }

  async customerLogin(myDto) {
    try {
      // Check if there is a customer with the provided email
      const existingCustomer = await this.customerRepo.findOne({
        where: { email: myDto.email },
      });

      if (!existingCustomer) {
        const newCustomer = this.createUser(myDto);
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
    console.log(myDto);

    const selectedProduct = await this.getProductById(myDto.productId)
    myDto.product = selectedProduct
    myDto.uniqueId = uuidv4()
    myDto.customer = myDto?.customerEmail && await this.getCustomerByEmail(myDto?.customerEmail)
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
  async createNewCartObject(product, cartsData) {
    for (const cartDataId of cartsData) {
      const cart = await this.getCartById(cartDataId);

      if (cart) {
        // Update the cart's buyingHistory property with the product object
        cart.history = product;
        await this.cartRepo.save(cart);
      }
    }
    return true;
  }

  // create new wish 
  async createNewWish(myDto) {

    myDto.product = await this.getProductById(myDto.productId)
    myDto.customer = await this.getCustomerById(myDto.customerId)

    const newWish = this.wishRepo.create({
      ...myDto
    });

    const savedProduct = await this.wishRepo.save(newWish);
    return savedProduct;
  }

  // create new product 
  async createNewProduct(myDto) {
    // Convert myDto.subCategories to an array if it's a string
    const subCategoriesArray = typeof myDto.subCategories === 'string' ? myDto.subCategories.split(',').map(Number) : myDto.subCategories;

    const subs = await this.viewAllProductSubSubCategories();

    // Filter the subs array to include only elements whose id is in subCategoriesArray
    const categories = subs.filter(cat => subCategoriesArray.includes(cat.id));

    myDto.subCategories = [...categories];

    const selectedColor = await this.getColorByName(myDto.color)

    myDto.color = selectedColor

    const newProduct = this.productRepo.create({
      ...myDto
    });

    const savedProduct = await this.productRepo.save(newProduct);
    return savedProduct;
  }

  // add product photos 
  async addProductPictures(myDto: any) {
    console.log(myDto, "666");
    // Retrieve the latest added product based on the ID field
    const latestProduct = await this.productRepo.findOne({
      where: { id: MoreThan(1) },
      order: { id: 'DESC' },
    });


    console.log(latestProduct);

    if (!latestProduct) {
      throw new Error('No product found');
    }

    // Update the product entity with the newly added pictures
    const filenames: string[] = myDto.filenames;
    console.log(filenames, "676");
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
  // async createNewColorObject(product, colorsData) {

  //   for (const colorData of colorsData) {
  //     const color = this.colorRepo.create({
  //       colorCode: colorData.colorCode,
  //       name: colorData.name,
  //       quantity: colorData?.quantity || 1,
  //       product: product,
  //     });

  //     await this.colorRepo.save(color);
  //     // this.createNewSizeObject(savedColor, colorData?.sizes)
  //     // this.createNewFileObject(savedColor, colorData?.files)

  //   }
  //   return true;
  // }

  // create new size object 
  // async createNewSizeObject(color, sizesData) {

  //   for (const sizeData of sizesData) {
  //     const createdSize = this.colorSizeRepo.create({
  //       size: sizeData.name,
  //       quantity: sizeData.quantity,
  //       color: color,
  //     });

  //     await this.colorSizeRepo.save(createdSize);
  //   }
  //   return true
  // }

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
