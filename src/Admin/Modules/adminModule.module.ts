/* eslint-disable prettier/prettier */
import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminController } from "../Controllers/admin.controller"
import { AdminEntity } from "../Entities/admin.entity";
import { AdminService } from "../Services/admin.service"
import { CustomerEntity } from "src/Customer/Entities/customer.entity";
import { ProductEntity } from "src/Global/Entities/product.entity";
import { BannerEntity } from "src/Global/Entities/banner.entity";
import { CategoryEntity } from "src/Global/Entities/category.entity";
import { SizeEntity } from "src/Global/Entities/size.entity";
import { BuyingHistoryEntity } from "src/Global/Entities/buyingHistory.entity";
import { ColorEntity } from "src/Global/Entities/colors.entity";
import { CartsEntity } from "src/Global/Entities/cart.entity";
import { CouponEntity } from "src/Global/Entities/coupon.entity";
import { DeliveryStatusEntity } from "src/Global/Entities/deliveryStatus.entity";
import { ProductPictureEntity } from "src/Global/Entities/product-pictures.entity";
import { PartnerEntity } from "src/Global/Entities/partner.entity";
import { SubCategoryEntity } from "src/Global/Entities/subCategory.entity";
import { WishEntity } from "src/Global/Entities/wish.entity";
import { EmployeeEntity } from "src/Employee/Entities/employee.entity";


@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                host: 'smtp.gmail.com',
                port: 465,
                ignoreTLS: true,
                secure: true,
                auth: {
                    user: 'mostaquenaimislam@gmail.com',
                    pass: '' //missing i
                },
            }
        }

        ),
        TypeOrmModule.forFeature([AdminEntity, BannerEntity, BuyingHistoryEntity, CategoryEntity, CustomerEntity, ColorEntity, CartsEntity, CouponEntity, DeliveryStatusEntity, EmployeeEntity, ProductPictureEntity, ProductEntity, PartnerEntity, SizeEntity, SubCategoryEntity, WishEntity])],
    controllers: [AdminController],
    providers: [AdminService],
})

export class AdminModule { }