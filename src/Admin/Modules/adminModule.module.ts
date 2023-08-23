import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminController } from "../Controllers/admin.controller"
import { AdminEntity } from "../Entities/admin.entity";
import { AdminService } from "../Services/admin.service"
import { CustomerEntity } from "src/Customer/Entities/customer.entity";
import { ProductEntity } from "src/Global/Entities/product.entity";
import { BannerEntity } from "src/Global/Entities/banner.entity";


@Module({
    imports:[
        MailerModule.forRoot({
            transport: {
              host: 'smtp.gmail.com',
                       port: 465,
                       ignoreTLS: true,
                       secure: true,
                       auth: {
                           user: 'mostaquenaimislam@gmail.com',
                           pass: 'vwaxokzhcyjpldl' //missing i
                       },
                      }
          }
          
          ),
        TypeOrmModule.forFeature([AdminEntity, CustomerEntity, ProductEntity, BannerEntity])],
controllers: [AdminController],
providers: [AdminService],
})

export class AdminModule {}