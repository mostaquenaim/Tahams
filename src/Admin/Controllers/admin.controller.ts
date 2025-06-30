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
  UploadedFiles,
  ParseFilePipeBuilder,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdminService } from '../Services/admin.service';
import { AdminForm } from '../DTOs/adminform.dto';
import { MulterError, diskStorage } from "multer";
import { AnyFilesInterceptor, FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import CouponForm from 'src/Global/DTOs/couponform.dto';
import ProductForm from 'src/Global/DTOs/productForm.dto';
import * as path from 'path';
import { extname } from 'path';
import * as fs from 'fs';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../Guards/roles.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  //Login to account 
  @Post('/signin')
  async signIn(@Body() myDto) {
    // console.log('ekhane ashche');
    const res = await this.adminService.signIn(myDto);
    // console.log(res,'reposne');
    return res
  }

  // check email 
  @Get('/check-email')
  async checkEmail(
    @Query('email') email: string
  ) {
    return await this.adminService.checkEmail(email)
  }

  // customerlogin 
  @Post('customer-login')
  @UsePipes(ValidationPipe)
  async customerLogin(
    @Body() myDto,
  ) {
    // console.log(myDto,"197");
    const response = await this.adminService.customerLogin(myDto);
    // console.log(response,"198");
    return response
  }

  // send mail 
  @Post('sendemail')
  sendEmail(@Body() mydata) {
    return this.adminService.sendEmail(mydata);
  }

  // otp 
  @Post('send-otp')
  @UsePipes(ValidationPipe)
  async sendOtp(@Body() sendOtpDto) {
    const result = await this.adminService.checkEmailAndSendOTP(sendOtpDto.email);
    return result
  }

  // verify otp 
  @Post('verify-otp')
  @UsePipes(ValidationPipe)
  async verifyOtp(@Body() verifyOtpDto) {
    // console.log(verifyOtpDto);
    return await this.adminService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  // add banner 
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
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
    // console.log(myDto)
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete('deleteBanner/:id')
  async deleteBanner(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteBanner(id);
  }

  //update banner by id
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Put('updateBanner/:id')
  @UsePipes(ValidationPipe)
  async updateBanner
    (
      @Param('id', ParseIntPipe) id: number,
      @Body() myDto,
    ) {
    await this.adminService.updateBanner(id, myDto);
  }

  // publish product 
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Put('publish-product/:id')
  async publishProduct(
    @Param('id') id: number,
    @Body('publishable') publishable: boolean,
  ): Promise<void> {
    return this.adminService.publishProduct(id, publishable);
  }

  // change banner image 
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
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
    @Body() myDto: any,
  ) {
    console.log("134", myDto);
    return this.adminService.createNewBuy(myDto);
  }

  // send message to customer   
  @Post('send-message-to-customer')
  @UsePipes(ValidationPipe)
  sendMessageToCustomer(
    @Body() myDto: any,
  ) {
    // console.log("134", myDto);
    return this.adminService.sendMessageToCustomer(myDto);
  }

  // update buying history 
  @Patch('update-history/:token')
  updateBuyingHistory(
    @Param('token') tt: string,
    @Query('email') email: string,
    @Body() updates: { [key: string]: any },
  ) {
    // console.log('in', updates);
    return this.adminService.updateBuyingHistory(tt, updates, email)
  }

  // update role by id 
  @Patch('update-role/:id')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto,
  ) {
    return this.adminService.updateRoleById(id, dto);
  }

  // approve req  
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch('approve-request')
  updateApproveReq(
    @Body() updateObj
  ) {
    // console.log(updateObj);
    return this.adminService.updateApproveReq(updateObj.id)
  }

  // update product
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Put('update-product/:id')
  @UseInterceptors(
    FileInterceptor('filename', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${ext}`);
        },
      }),
    }),
  )
  async updateProduct(
    @Param('id') id,
    @Body() updateProductDto,
    @UploadedFile() filename?: Express.Multer.File,
  ) {
    try {
      // console.log(id,updateProductDto);
      // Call the service to update product
      const updatedProduct = await this.adminService.updateProduct(
        id,
        updateProductDto,
        filename,
      );
      return updatedProduct;
    } catch (error) {
      throw new BadRequestException('Product update failed.');
    }
  }

  // update buying history by id 
  @Patch('update-buying-history-status-by-token/:token')
  async updateBuyingHistoryStatusByToken(
    @Param('token') token: string,
    @Query('email') email: string,
    @Body() updates: any,
  ) {
    const result = await this.adminService.updateBuyingHistoryStatusByToken(token, updates, email)
    // console.log(result);
    return result
  }

  // get buying histoy by id 
  @Get('get-buying-history-by-token/:token')
  async getBuyingHistoryByToken(
    @Param('token') token,
    @Query('email') email: string,
  ) {
    const result = await this.adminService.getBuyingHistoryByToken(token, email)
    return result
  }

  // get buying history by id 
  @Get('get-buying-history-status-by-token/:token')
  async getBuyingHistoryStatusByToken(
    @Param('token') token,
    // @Query('email') email: string,
  ) {
    const result = await this.adminService.getBuyingHistoryStatusByToken(token)
    // console.log(result);
    return result
  }

  // add payment info 
  @Post('/add-payment')
  @UseInterceptors(FileInterceptor('screenshot',
    {
      storage: diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname)
        }
      })
    }))
  addPaymentInfo(
    // @Param('token') token: string,
    @Body() PaymentDetails,
    @UploadedFile() file: Express.Multer.File) {
    PaymentDetails.screenshot = file?.filename
    return this.adminService.addPaymentInfo(PaymentDetails)
  }

  // get particular customer all buying history 
  @Get('get-all-buying-history')
  getAllBuyingHistories(
    @Query('email') email: string,
  ) {
    return this.adminService.getAllBuyingHistories(email)
  }

  // get all customers / users  
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('get-all-users')
  getAllUsers(
  ) {
    return this.adminService.getAllUsers()
  }

  // get all roles 
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('get-all-roles')
  getAllRoles(
  ) {
    return this.adminService.getAllRoles()
  }

  // add new cart 
  @Post('add-to-cart')
  @UsePipes(ValidationPipe)
  async createNewCart(
    @Body() myDto,
  ) {
    const response = await this.adminService.createNewCart(myDto);
    return response
  }

  // add new wish 
  @Post('add-Wish')
  @UsePipes(ValidationPipe)
  createNewWish(
    @Body() myDto,
  ) {
    // console.log(myDto, 'wish dto');
    return this.adminService.createNewWish(myDto);
  }



  // remove wish list item
  @Delete('remove-wish/:wishId')
  // @UsePipes(ValidationPipe)
  removeWish(
    @Param('wishId') wishId: number,
  ) {
    // console.log('delete wush',wishId);
    return this.adminService.removeWish(wishId);
  }

  // delete a cart 
  @Delete('delete-cart/:uniqueId')
  deleteCartItem(
    @Param('uniqueId') id,
  ) {
    // console.log(id,"210");
    return this.adminService.deleteCartItem(id);
  }

  // delete history 
  @Put('delete-history/:id')
  deleteHistory(
    @Param('id') id,
    @Query('email') email,
  ) {
    // console.log(id,"210");
    return this.adminService.deleteHistory(id, email);
  }

  // delete carts 
  @Delete('delete-carts')
  deleteCarts(
    @Body() myDto
  ) {
    // console.log(myDto,"220");
    return this.adminService.deleteCarts(myDto.checkedItems);
  }

  // get particular customer cart history 
  @Get('get-all-carts')
  getAllCarts(
    @Query('email') email: string,
  ) {
    // console.log(email, "209");
    return this.adminService.getAllCarts(email)
  }

  // view category
  @Get('view-product-categories')
  async viewProductCategories() {
    const result = await this.adminService.viewProductCategories();
    return result;
  }

  // view popular items
  @Get('view-popular-items')
  async viewPopularItems() {
    const result = await this.adminService.viewPopularItems();
    return result;
  }

  // view new arrivals 
  @Get('view-new-arrivals')
  async viewNewArrivals() {
    const result = await this.adminService.viewNewArrivals();
    return result;
  }

  // view active pop up 
  @Get('view-active-pop-up')
  async viewActivePopUp() {
    const result = await this.adminService.viewActivePopUp();
    return result;
  }

  // view all pop up 
  @Get('view-all-pop-up')
  async viewAllPopUp() {
    const result = await this.adminService.viewAllPopUp();
    return result;
  }

  // view genders
  @Get('view-genders')
  async viewGenders() {
    const result = await this.adminService.viewGenders();
    return result;
  }

  // view cancellation or return requests
  @Get('view-cancellation-or-return-requests')
  async viewRequests(
    @Query('email') email: string,
  ) {
    const result = await this.adminService.viewRequests(email);
    return result;
  }

  // view all sub sub category
  @Get('view-product-sub-sub-categories')
  async viewAllProductSubSubCategories() {
    const result = await this.adminService.viewAllProductSubSubCategories();
    return result;
  }

  // view all colors
  @Get('view-colors')
  async viewColors() {
    const result = await this.adminService.viewColors();
    return result;
  }

  // view all fabrics
  @Get('view-fabrics')
  async viewFabrics() {
    const result = await this.adminService.viewFabrics();
    return result;
  }

  // view category
  @Get('view-product-sub-categories')
  async viewAllProductSubCategories() {
    const result = await this.adminService.viewAllProductSubCategories();
    return result;
  }

  // view sub category by category
  @Get('view-product-sub-category/:id')
  viewProductSubCategories(
    @Param('id') id: number
  ) {
    return this.adminService.viewProductSubCategories(id);
  }

  // view sub sub-category by category
  @Get('view-product-sub-sub-category/:catId')
  viewProductSubSubCategories(
    @Param('catId') catId: number
  ) {
    return this.adminService.viewProductSubSubCategories(catId);
  }

  // check if wished 
  @Get('check-wish-by-user-and-product')
  checkIfWished(
    @Query('customerEmail') customerEmail: string,
    @Query('productId') productId: number
  ) {
    return this.adminService.checkIfWished(productId, customerEmail)
  }

  // get sub category by id 
  @Get('get-sub-sub-cat-by-id/:id')
  getSubCatById(
    @Param('id') id: number
  ) {
    return this.adminService.getSubSubCategoryById(id);
  }

  // get sub category by id 
  @Get('get-ft-photo-by-product-id/:id')
  getProductFtImage(
    @Param('id') id: number
  ) {
    return this.adminService.getProductFtImage(id);
  }

  // get category by id 
  @Get('getCategoryById/:id')
  @UsePipes(ValidationPipe)
  getCategoryById(
    @Param('id') id,
  ) {
    return this.adminService.getCategoryByName(id);
  }

  // get products by category id
  @Get('get-product-by-cat/:name')
  @UsePipes(ValidationPipe)
  getProductByCat(
    @Param('name') name,
  ) {
    // console.log(name);
    return this.adminService.getProductByCat(name);
  }

  // get products by sub sub category id
  @Get('get-product-by-sub-sub-cat/:id')
  @UsePipes(ValidationPipe)
  getProductBySubSubCatId(
    @Param('id') id,
  ) {
    return this.adminService.getPublishableProductsBySubSubCatId(id);
  }

  // get user by email
  @Get('get-user-by-email/:email')
  @UsePipes(ValidationPipe)
  getUserByEmail(
    @Param('email') email,
  ) {
    return this.adminService.getUserByEmail(email);
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

  //update category by id
  @Put('updateSubCategory/:id')
  @UsePipes(ValidationPipe)
  async updateSubCategory
    (
      @Param('id', ParseIntPipe) id: number,
      @Body() myDto,
    ) {
    await this.adminService.updateSubCategory(id, myDto);
  }

  //update product type name
  @Put('update-product-type-name/:id')
  @UsePipes(ValidationPipe)
  async updateProductTypeName
    (
      @Param('id', ParseIntPipe) id: number,
      @Body() myDto,
    ) {
    await this.adminService.updateProductTypeName(id, myDto);
  }

  //update active pop up
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Put('update-active-pop-up/:id')
  // @UsePipes(ValidationPipe)
  async updateActivePop
    (
      @Param('id') id: number,
      // @Body() myDto,
    ) {
    return this.adminService.updateActivePop(id);
  }

  //update sub sub category by id
  @Put('update-sub-sub-category/:id')
  @UseInterceptors(
    FileInterceptor('myFile', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${ext}`);
        },
      }),
    }),
  )
  // @UsePipes(ValidationPipe)
  async updateSubSubCategory(
    @Param('id', ParseIntPipe) id: number,
    // @Body() myDto,
    @UploadedFile() myFile: Express.Multer.File, // Add this to handle the file
  ) {
    // console.log(myFile,'666'); // Access the uploaded file here
    await this.adminService.updateSubSubCategory(id, myFile.filename);
  }

  // update user address 
  @Put('update-user-address/:id')
  async updateUserAddress(
    @Param('id') id: number,
    @Body() updateAddressDto
  ) {
    return this.adminService.updateUserAddress(id, updateAddressDto);
  }

  // add new category 
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('add-category')
  @UsePipes(ValidationPipe)
  createNewCategory(
    @Body() myDto,
  ) {
    // console.log(myDto,"337");
    return this.adminService.createNewCategory(myDto);
  }

  // add new payment method 
  @Post('add-payment-method')
  @UsePipes(ValidationPipe)
  createPaymentMethod(
    @Body() myDto,
  ) {
    return this.adminService.createPaymentMethod(myDto);
  }

  // increase product view 
  @Post('increase-product-view/:id')
  @UsePipes(ValidationPipe)
  increaseProductView(
    @Param('id') id: number,
    @Query('email') email: string
  ) {
    return this.adminService.increaseProductView(id, email);
  }

  // sync view count
  @Get('sync-view-count')
  syncViewCount() {
    return this.adminService.syncViewCount();
  }

  // sync sales count
  @Put('sync-sales-count')
  syncSalesCount() {
    return this.adminService.syncSalesCount();
  }

  // add new sub-category 
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('add-subCategory')
  @UsePipes(ValidationPipe)
  createNewSubCategory(
    @Body() myDto,
  ) {
    return this.adminService.createNewSubCategory(myDto);
  }

  // add new sub-sub-category 
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('add-sub-subCategory')
  @UsePipes(ValidationPipe)
  createNewSubSubCategory(
    @Body() myDto,
  ) {
    return this.adminService.createNewSubSubCategory(myDto);
  }

  // confirm of cancellation
  @Post('confirm-return-or-cancellation')
  async confirmReturnOrCancellation(
    @Body('selectedProducts') selectedProducts: string[],
    @Body('reason') reason: string,
  ) {
    return await this.adminService.confirmReturnOrCancellation(selectedProducts, reason);
  }

  // change category image 
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
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

  // add new color 
  @Post('add-color')
  @UsePipes(ValidationPipe)
  createNewColor(
    @Body() myDto,
  ) {
    return this.adminService.createNewColor(myDto);
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

  // disable sub category 
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Put('disable-or-enable-sub-category/:id')
  disableSubSubCategory(
    @Param('id') id: number
  ) {
    return this.adminService.disableSubSubCategory(id);
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

  //logout
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: any) {
    const tokenJti = req.user.jti; // Get the JWT ID from user payload
    const exp = 3600; // Token expiry time (same as in sign)

    // Save blacklisted token in DB (replace with your DB service logic)
    await this.adminService.addToBlacklist(tokenJti, exp);

    return { message: 'Logged out successfully' };
  }

  // create new account 
  @Post('create')
  createUser(@Body() myDto) {
    return this.adminService.createUser(myDto);
  }

  // create new role 
  @Post('create-role')
  createNewRole(@Body() myDto) {
    return this.adminService.createNewRole(myDto);
  }

  // view all product 
  @Get('view-all-products')
  viewAllProducts(
    @Query('filter') query: any
  ) {
    // console.log(query);
    return this.adminService.viewAllProducts(query && query);
  }

  // view related products 
  @Get('related-products')
  viewRelatedProducts(
    @Query('category') category: number,
    @Query('exclude') excludeId: number,
  ) {
    return this.adminService.viewRelatedProducts(category, excludeId);
  }

  // get product by search query
  @Get('search-products')
  async getProductByQuery(@Query('q') searchQuery: string) {
    console.log('Search Query:', searchQuery);  // Debugging
    const products = await this.adminService.getProductByQuery(searchQuery);
    return products;
  }

  // view size
  @Get('view-product-sizes')
  viewProductSizes() {
    return this.adminService.viewProductSizes();
  }

  // view all views
  @Get('view-all-products-views')
  viewAllProductsViews() {
    return this.adminService.viewAllProductsViews();
  }

  // get product by id 
  @Get('get-product-by-id/:id')
  @UsePipes(ValidationPipe)
  async getProductById(
    @Param('id') id,
  ) {
    const result = await this.adminService.getProductById(id)
    return result
  }

  // delete product by id  
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete('delete-product/:id')
  async deleteProductById(
    @Param('id') id: number,
    @Query('email') email: string
  ) {
    console.log(id);
    return this.adminService.deleteProductById(id, email);
  }

  // delete role by id  
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete('delete-role/:id')
  async deleteRoleById(
    @Param('id') id: number,
  ) {
    console.log(id);
    return this.adminService.deleteRoleById(id);
  }

  // delete product type or sub sub category by id  
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete('delete-product-type/:id')
  async deleteProductTypeById(
    @Param('id') id: number,
  ) {
    console.log(id);
    return this.adminService.deleteProductTypeById(id);
  }

  // delete category by id  
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete('delete-category/:id')
  async deleteCategoryById(
    @Param('id') id: number,
  ) {
    return this.adminService.deleteCategoryById(id);
  }

  // delete sub category by id  
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete('delete-sub-category/:id')
  async deleteSubCategoryById(
    @Param('id') id: number,
  ) {
    return this.adminService.deleteSubCategoryById(id);
  }

  // delete size by id 
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete('deleteSize/:id')
  async deleteSizeById(@Param('id', ParseIntPipe) id: number) {

    return this.adminService.deleteSizeById(id);
  }

  // add new size 
  @Post('add-size')
  @UsePipes(ValidationPipe)
  createNewSize(
    @Body() myDto,
  ) {
    return this.adminService.createNewSize(myDto);
  }

  // add new fabric 
  @Post('add-fabric')
  @UsePipes(ValidationPipe)
  createNewFabric(
    @Body() myDto,
  ) {
    return this.adminService.createNewFabric(myDto);
  }

  //add new product
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('/add-product')
  @UseInterceptors(FileInterceptor('myfile',
    {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg|gif)$/))
          cb(null, true);
        else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'myfile'), false);
        }
      },
      limits: { fileSize: 30000000 },
      storage: diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname)
        },
      })
    }
  ))
  @UsePipes(new ValidationPipe)
  addProductFunc(@Body() mydata, @UploadedFile() imageobj: Express.Multer.File) {
    mydata.filename = imageobj.filename;
    return this.adminService.createNewProduct(mydata);
  }

  // update discount 
  @Put('update-discount')
  updateDiscount(
    @Body() mydata
  ) {
    // console.log(mydata, 'md');
    return this.adminService.updateDiscount(mydata);
  }

  //add new arrivals
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('/add-new-arrivals')
  @UseInterceptors(FileInterceptor('filename',
    {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg|gif)$/))
          cb(null, true);
        else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'filename'), false);
        }
      },
      limits: { fileSize: 30000000 },
      storage: diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname)
        },
      })
    }
  ))
  @UsePipes(new ValidationPipe)
  addNewArrivals(@Body() mydata, @UploadedFile() imageobj: Express.Multer.File) {
    // console.log(imageobj.filename,mydata);
    mydata.filename = imageobj.filename;
    return this.adminService.addNewArrivals(mydata);
  }

  //add pop up
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('/add-new-pop-up')
  @UseInterceptors(FileInterceptor('filename',
    {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg|gif)$/))
          cb(null, true);
        else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'filename'), false);
        }
      },
      limits: { fileSize: 30000000 },
      storage: diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname)
        },
      })
    }
  ))
  @UsePipes(new ValidationPipe)
  addNewPopUp(@Body() mydata, @UploadedFile() imageobj: Express.Multer.File) {
    // console.log(imageobj.filename,mydata);
    console.log('test');
    mydata.filename = imageobj.filename;
    return this.adminService.addNewPopUp(mydata);
  }

  // product pictures add 
  @Post('/add-product-pictures')
  @UseInterceptors(FilesInterceptor('myfiles', 10, {
    fileFilter: (req, file, cb) => {
      if (file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Unsupported file type'), false);
      }
    },
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async addProductPictures(@UploadedFiles() files, @Body() mydata) {
    // console.log(files,"523");
    // console.log(mydata); // Log other data sent with the request
    const filenames = files.map(file => file.filename);
    // console.log(filenames,"525"); // Log filenames of uploaded files
    mydata.filenames = filenames; // Assuming your service method expects an array of filenames
    return this.adminService.addProductPictures(mydata);
  }

  @Post('/update-product-pictures')
  @UseInterceptors(FilesInterceptor('myfiles', 10, {
    fileFilter: (req, file, cb) => {
      if (file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Unsupported file type'), false);
      }
    },
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async updateProductPictures(@UploadedFiles() files, @Body() mydata) {
    // console.log(files,"523");
    // console.log(mydata); // Log other data sent with the request
    const filenames = files.map(file => file.filename);
    // console.log(filenames,"525"); // Log filenames of uploaded files
    mydata.filenames = filenames; // Assuming your service method expects an array of filenames
    return this.adminService.updateProductPictures(mydata);
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

  // check admin
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('/checkIfAdmin')
  isAdminCheck() {
    return { isAdmin: true };
  }


  // get wishlist 
  @Get('get-wish-by-user/:email')
  async getWishByUser(@Param('email') email: string) {
    // console.log(email,"572");
    const res = await this.adminService.getWishByUser(email);
    // console.log(res,"574");
    return res
  }

  // testing 
  @Get('/getimage/:name')
  getImages(@Param('name') name, @Res() res) {
    // console.log(name,"568");
    res.sendFile(name, { root: './uploads' })
  }

}
