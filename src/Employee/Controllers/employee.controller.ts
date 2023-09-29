import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
  UploadedFile,
  Res
} from '@nestjs/common';
import { EmployeeService } from '../Services/employee.service';
import { MulterError, diskStorage } from "multer";
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeeForm } from '../DTOs/employeeform.dto';



@Controller('employee')
export class EmployeeController {
  constructor(private readonly appService: EmployeeService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('create')
  createUser(@Body() createUser: EmployeeForm) {
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
