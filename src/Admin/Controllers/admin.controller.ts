/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
  UnauthorizedException,
  Session,
  Put,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { AdminService } from '../Services/admin.service';
import { AdminForm } from '../DTOs/adminform.dto';
import { MulterError, diskStorage } from "multer";
import { FileInterceptor } from '@nestjs/platform-express';
import CouponForm from 'src/Global/DTOs/couponform.dto';
import ProductForm from 'src/Global/DTOs/productForm.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  //Login to admin account 
  @Post('/signin')
  async signIn(@Session() session, @Body() myDto: AdminForm) {

    const res = await (this.adminService.signIn(myDto));
    if (res == true) {
      session.email = myDto.email;
      return (session.email);
    }
    else {
      throw new UnauthorizedException({ message: "invalid" });
    }
  }

  // add banner 
  @Post('add-banner')
  @UseInterceptors(FileInterceptor('filename',
    {
      storage: diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname)
        }
      })

    }))
  addBanner(@Body() myDto, @UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 160000 }),
      new FileTypeValidator({ fileType: 'png|jpg|jpeg|' }),
    ],
  }),) file: Express.Multer.File) {

    myDto.filename = file.filename;
    console.log(myDto)
    return this.adminService.addBanner(myDto);
  }

  // get all banners 
  @Get('all-banners')
  viewAllBanners() {
    return this.adminService.viewAllBanners();
  }

  // get banner by id 
  @Get('banner-by-id/:id')
  viewBannerById(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.adminService.getBannerById(id);
  }

  // delete banner 
  @Delete('deleteBanner/:id')
  async deleteBanner(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteBanner(id);
  }

  //update banner by id
  @Put('updateBanner/:id')
  @UsePipes(ValidationPipe)
  async updateBanner
    (
      @Param('id', ParseIntPipe) id: number,
      @Body() myDto,
    ) {
    await this.adminService.updateBanner(id, myDto);
  }

  // change banner image 
  @Post(('changeBannerImage/:id'))
  @UseInterceptors(FileInterceptor('filename',
    {
      storage: diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname)
        }
      })
    }))
  changeBannerImage(
    @Param('id') id,
    // @Body('file') filename,
    @UploadedFile() file: Express.Multer.File): object {
    return this.adminService.changeBannerImage(id, file.filename);
  }

  // add new buying  
  @Post('add-to-buy')
  @UsePipes(ValidationPipe)
  createNewBuy(
    @Body() myDto,
  ) {
    return this.adminService.createNewBuy(myDto);
  }

  // update buying history 
  @Patch('update-buy-reference/:token')
  updateBuyingHistory(
    @Param('token') id,
    @Query('email') email: string,
    @Body('PaymentDetails') details,
  ) {
    return this.adminService.updateBuyingHistory(id, details, email)
  }

  // get buying histoy by id 
  @Get('get-buying-history-by-id/:token')
  getBuyingHistoryById(
    @Param('token') id,
  ) {
    return this.adminService.getBuyingHistoryById(id)
  }

  // get particular customer all buying history 
  @Get('get-all-buying-history')
  getAllBuyingHistories(
    @Query('email') email: string,
  ) {
    return this.adminService.getAllBuyingHistories(email)
  }

  // add new cart 
  @Post('add-to-cart')
  @UsePipes(ValidationPipe)
  createNewCart(
    @Body() myDto,
  ) {
    return this.adminService.createNewCart(myDto);
  }

  // delete a cart 
  @Delete('delete-cart/:uniqueId')
  deleteCartItem(
    @Param('token') id,
    @Query('email') email,
  ) {
    return this.adminService.deleteCartItem(id, email);
  }

  // delete carts 
  @Delete('delete-carts')
  deleteCarts(
    @Query('email') email,
    @Body() cartArray
  ) {
    return this.adminService.deleteCarts(cartArray, email);
  }

  // get particular customer cart history 
  @Get('get-all-carts')
  getAllCarts(
    @Query('email') email: string,
  ) {
    return this.adminService.getAllCarts(email)
  }

  // view category
  @Get('view-product-categories')
  async viewProductCategories() {
    const result = await this.adminService.viewProductCategories();
    console.log(result);
    return result;
  }

  // view sub category by category
  @Get('view-product-sub-categories/:id')
  viewProductSubCategories(
    @Param('id') id: number
  ) {
    return this.adminService.viewProductSubCategories(id);
  }

  // now here 
  // view sub sub-category by category
  @Get('view-product-sub-sub-categories/:id')
  viewProductSubSubCategories(
    @Param('id') id: number
  ) {
    return this.adminService.viewProductSubSubCategories(id);
  }

  // get category by id 
  @Get('getCategoryById/:id')
  @UsePipes(ValidationPipe)
  getCategoryById(
    @Param('id') id,
  ) {
    return this.adminService.getCategoryById(id);
  }

  // get products by category id
  @Get('getProductByCat/:id')
  @UsePipes(ValidationPipe)
  getProductByCatId(
    @Param('id') id,
  ) {
    return this.adminService.getProductByCatId(id);
  }

  //update category by id
  @Put('updateCategory/:id')
  @UsePipes(ValidationPipe)
  async updateCategory
    (
      @Param('id', ParseIntPipe) id: number,
      @Body() myDto,
    ) {
    await this.adminService.updateCategory(id, myDto);
  }

  // add new category 
  @Post('addCategory')
  @UsePipes(ValidationPipe)
  createNewCategory(
    @Body() myDto,
  ) {
    return this.adminService.createNewCategory(myDto);
  }

  // add new sub-category 
  @Post('addSubCategory')
  @UsePipes(ValidationPipe)
  createNewSubCategory(
    @Body() myDto,
  ) {
    return this.adminService.createNewSubCategory(myDto);
  }

  // change category image 
  @Post(('changeCategoryImage/:id'))
  @UseInterceptors(FileInterceptor('filename',
    {
      storage: diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname)
        }
      })
    }))
  changeCategoryImage(
    @Param('id') id,
    // @Body('file') filename,
    @UploadedFile() file: Express.Multer.File): object {
    return this.adminService.changeCategoryImage(id, file.filename);
  }

  // add new coupon 
  @Post('add-coupon')
  @UsePipes(ValidationPipe)
  createNewCoupon(
    @Body() myDto: CouponForm,
  ) {
    return this.adminService.createNewCoupon(myDto);
  }

  // get all coupons 
  @Get('get-coupons')
  getAllCoupons() {
    return this.adminService.getAllCoupons();
  }

  // get particular coupon 
  @Get('get-coupons/:id')
  getParticularCoupon(
    @Param('id') id: number
  ) {
    return this.adminService.getParticularCoupon(id);
  }

  // disable coupon 
  @Patch('disable-coupon/:id')
  disableCoupon(
    @Param('id') id: number
  ) {
    return this.adminService.disableCoupon(id);
  }

  // get all delivery status 
  @Get('get-all-delivery-status')
  getAllDeliveryStatus(
  ) {
    return this.adminService.getAllDeliveryStatus()
  }

  // get all payment methods
  @Get('get-all-payment-methods')
  getAllPaymentMethod(
  ) {
    return this.adminService.getAllPaymentMethod()
  }

  // send mail 
  @Post('sendemail')
  sendEmail(@Body() mydata) {
    return this.adminService.sendEmail(mydata);
  }

  //logout
  @Get('/logout')
  logout(@Session() session) {

    if (session) {
      session.destroy()
      return { message: "you are logged out successfully" };
    }

    else {
      throw new UnauthorizedException("Can't log out");
    }
  }

  // create new account 
  @Post('create')
  createUser(@Body() createUser: AdminForm) {
    return this.adminService.createUser(createUser);
  }

  // view all product 
  @Get('view-all-products')
  viewAllProduct() {
    return this.adminService.viewAllProduct();
  }

  // view size
  @Get('view-product-sizes')
  viewProductSizes() {
    return this.adminService.viewProductSizes();
  }

  // get product by id 
  @Get('getProductById/:id')
  @UsePipes(ValidationPipe)
  getProductById(
    @Param('id') id,
  ) {
    return this.adminService.getProductById(id);
  }

  // delete product by id  
  @Delete('deleteProduct/:id')
  async deleteProductById(@Param('id', ParseIntPipe) id: number) {

    return this.adminService.deleteProductById(id);
  }

  // delete size by id 
  @Delete('deleteSize/:id')
  async deleteSizeById(@Param('id', ParseIntPipe) id: number) {

    return this.adminService.deleteSizeById(id);
  }

  // add new size 
  @Post('addSize')
  @UsePipes(ValidationPipe)
  createNewSize(
    @Param('id') id,
    @Session() session,
    @Body() myDto,
  ) {
    return this.adminService.createNewSize(myDto);
  }

  // add new product 
  @Post('add-product')
  @UsePipes(ValidationPipe)
  createNewProduct(
    @Body() myDto: ProductForm,
  ) {
    console.log("myDto", myDto)
    return this.adminService.createNewProduct(myDto);
  }

  // add new wish 
  @Post('addWish')
  @UsePipes(ValidationPipe)
  createNewWish(
    // @Body('colors') colors,
    @Body() myDto,
  ) {
    console.log("myDto", myDto)
    return this.adminService.createNewWish(myDto);
  }

  // testing 
  @Get('/getimage/:name')
  getImages(@Param('name') name, @Res() res) {
    res.sendFile(name, { root: './uploads' })
  }

  // update admin profile 
  @Put('/updateProfile')
  @UseInterceptors(FileInterceptor('filename',
    {
      storage: diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname)
        }
      })
    }))
  updateAdmin(
    @Body() myDto: AdminForm, @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 160000 }),
        new FileTypeValidator({ fileType: 'png|jpg|jpeg|' }),
      ],
    }),) file: Express.Multer.File) {

    return this.adminService.updateAdmin(myDto, myDto.email);

  }

}
