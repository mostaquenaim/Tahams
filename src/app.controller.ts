import { Body, Controller, Get, Param, Post, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { MulterError, diskStorage } from "multer";
import { FileInterceptor } from '@nestjs/platform-express';



@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


}
