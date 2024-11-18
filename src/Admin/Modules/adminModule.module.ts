/* eslint-disable prettier/prettier */
import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminController } from "../Controllers/admin.controller"
import { AdminEntity } from "../Entities/admin.entity";
import { AdminService } from "../Services/admin.service"
import { UserEntity } from "src/Global/Entities/user.entity";
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
import { PaymentMethodEntity } from "src/Global/Entities/paymentMethod.entity";
import { SubSubCategoryEntity } from "src/Global/Entities/subSubCategory.entity";
import { ColorSizeEntity } from "src/Global/Entities/color-size-combined.entity";
import { PaymentInfo } from "src/Global/Entities/paymentInfo.entity";
import { FabricEntity } from "src/Global/Entities/fabrics.entity";
import { ProductSizeCategoryEntity } from "src/Global/Entities/productSizeCategory.entity";
import { OtpEntity } from "src/Global/Entities/otp.entity";
// Load environment variables
import * as dotenv from 'dotenv';
import { ViewProductEntity } from "src/Global/Entities/viewProduct.entity";
import { ReturnEntity } from "src/Global/Entities/return.entity";
import { GenderEntity } from "src/Global/Entities/gender.entity";
dotenv.config();

@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                host: 'smtp.gmail.com',
                port: 465,
                ignoreTLS: true,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                },
            } 
        }

        ),
        TypeOrmModule.forFeature([AdminEntity, BannerEntity, BuyingHistoryEntity, CategoryEntity, ColorSizeEntity, ColorEntity, CartsEntity, CouponEntity, DeliveryStatusEntity, EmployeeEntity, FabricEntity, GenderEntity, OtpEntity, PaymentInfo, PaymentMethodEntity, ProductPictureEntity, ProductEntity, ProductSizeCategoryEntity, PartnerEntity, ReturnEntity, SizeEntity, SubCategoryEntity, SubSubCategoryEntity, UserEntity, ViewProductEntity, WishEntity])],
    controllers: [AdminController],
    providers: [AdminService],
})

export class AdminModule { }