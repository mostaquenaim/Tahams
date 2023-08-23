import { Body, Controller, Get, Param, Post, UseInterceptors, UploadedFile, Res, UnauthorizedException, Session, Put, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Delete } from '@nestjs/common';
import { AdminService } from '../Services/admin.service';
import { AdminForm } from '../DTOs/adminform.dto';
import { MulterError, diskStorage } from "multer";
import { FileInterceptor } from '@nestjs/platform-express';
import { get } from 'http';



@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get()
  getHello(): string {
    return this.adminService.getHello();
  }

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
    console.log(createUser)
    return this.adminService.createUser(createUser);
  }

  // add banner
  @Post('add-banner-images')
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
  addBannerImages(@UploadedFile() file: Express.Multer.File) {
    return file.filename;
  }

  // delete banner image 
  @Delete('delete-banner-image')
  deleteAdmin(@Session() session, @Body('filename') file) {

    if (session.email) {
      if (this.adminService.deleteBannerImage(file)) {
        return true;
      }
    }
    return false;
  }

  // add product 
  @Post('add-new-product')
  @UseInterceptors(FileInterceptor('filename',
    {
      storage: diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname)
        }
      })

    }))
  addNewProduct(@Body() myDto, @UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 40000 }),
      new FileTypeValidator({ fileType: 'png|jpg|jpeg|' }),
    ],
  }),) file: Express.Multer.File) {

    myDto.filename = file.filename;

    return this.adminService.addNewProduct(myDto);
    // console.log(file)
  }

  // view product 
  @Get('view-all-product')
  viewAllProduct(){
    return this.adminService.viewAllProduct();
  }

  // view product by category
  




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
    console.log(file);
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
