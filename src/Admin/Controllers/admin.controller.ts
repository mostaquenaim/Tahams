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
} from '@nestjs/common';
import { AdminService } from '../Services/admin.service';
import { AdminForm } from '../DTOs/adminform.dto';
import { MulterError, diskStorage } from "multer";
import { FileInterceptor } from '@nestjs/platform-express';



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

  // send mail 
  @Post('sendemail')
  sendEmail(@Body() mydata) {
    return this.adminService.sendEmail(mydata);
  }

  // add banner 
  @Post('addBanner')
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

  // delete banner 
  @Delete('deleteBanner/:id')
  async deleteBanner(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteBanner(id);
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

  // add new product 
  // @Post('add-new-product')
  // @UseInterceptors(
  //   FileInterceptor('filename', {
  //     storage: diskStorage({
  //       destination: './uploads',
  //       filename: function (req, file, cb) {
  //         // Remove spaces and replace them with hyphens in the original filename
  //         const originalnameWithoutSpaces = file.originalname.replace(/ /g, '-');
  //         const uniqueFilename = Date.now() + '-' + originalnameWithoutSpaces;
  //         cb(null, uniqueFilename);
  //       },
  //     }),
  //   }),
  // )
  // addNewProduct(@Body() myDto, @UploadedFile(new ParseFilePipe({
  //   validators: [
  //     new MaxFileSizeValidator({ maxSize: 4000000 }),
  //     new FileTypeValidator({ fileType: 'png|jpg|jpeg' }),
  //   ],
  // })) file: Express.Multer.File) {
  //   myDto.filename = file.filename;
  //   return this.adminService.addNewProduct(myDto);
  // }

  // view all product 
  @Get('view-all-products')
  viewAllProduct() {
    return this.adminService.viewAllProduct();
  }

  // view sub category
  @Get('view-product-sub-categories')
  viewProductSubCategories() {
    return this.adminService.viewProductSubCategories();
  }

  // view category
  @Get('view-product-categories')
  viewProductCategories() {
    return this.adminService.viewProductCategories();
  }

  // view size
  @Get('view-product-sizes')
  viewProductSizes() {
    return this.adminService.viewProductSizes();
  }

  // get category by id 
  @Get('getCategoryById/:id')
  @UsePipes(ValidationPipe)
  getCategoryById(
    @Param('id') id,
  ) {
    return this.adminService.getCategoryById(id);
  }

  // get product by id 
  @Get('getProductById/:id')
  @UsePipes(ValidationPipe)
  getProductById(
    @Param('id') id,
  ) {
    return this.adminService.getProductById(id);
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

  // delete category by id 
  // @Delete('deleteCategory/:id')
  // async deleteCategoryById(@Param('id', ParseIntPipe) id: number) {

  //   return this.adminService.deleteCategoryById(id);
  // }

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

  // add new category 
  @Post('addCategory')
  @UsePipes(ValidationPipe)
  createNewCategory(
    @Body() myDto,
  ) {
    return this.adminService.createNewCategory(myDto);
  }

  // add new coupon 
  @Post('addCoupon')
  @UsePipes(ValidationPipe)
  createNewCoupon(
    @Body() myDto,
  ) {
    return this.adminService.createNewCoupon(myDto);
  }

  // add new sub-category 
  @Post('addSubCategory')
  @UsePipes(ValidationPipe)
  createNewSubCategory(
    @Param('id') id,
    @Session() session,
    @Body() myDto,
  ) {
    return this.adminService.createNewSubCategory(myDto);
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
  @Post('addProduct')
  @UsePipes(ValidationPipe)
  createNewProduct( 
    @Body() myDto,  
  ) {
    console.log("myDto", myDto)
    return this.adminService.createNewProduct(myDto);
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

  // change banner image 
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
  changeBannerImage(
    @Param('id') id,
    // @Body('file') filename,
    @UploadedFile() file: Express.Multer.File): object {
    return this.adminService.changeBannerImage(id, file.filename);
  }

  // testing
  @Get('name')
  getName(): string {
    return this.adminService.getName();
  }

  // testing
  @Get(':id')
  findOne(@Param('id') xd: string): string {
    return `This action returns a #${xd} cat`;
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file',
    {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
          cb(null, true);
        else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
        }
      },
      limits: { fileSize: 30000 },
      storage: diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname)
        },
      })
    }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {

    return file.filename;
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
