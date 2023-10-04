import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { CustomerService } from '../Services/customer.service';
import { MulterError, diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomerForm } from '../DTOs/customerform.dto';



@Controller('customer')
export class CustomerController {
  constructor(private readonly appService: CustomerService) { }

  @Get()
  getHome(): string {
    return this.appService.getHome();
  }

  @Post('create')
  createUser(@Body() createUser: CustomerForm) {
    console.log(createUser)
    return this.appService.createUser(createUser);
  }

  @Get('name')
  getName(): string {
    return this.appService.getName();
  }

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

  @Get('/getimage/:name')
  getImages(@Param('name') name, @Res() res) {
    res.sendFile(name, { root: './uploads' })
  }





}
