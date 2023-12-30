/* eslint-disable prettier/prettier */
import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductEntity } from "../Entities/product.entity";
import { PartnerEntity } from "../Entities/partner.entity";
import { BannerEntity } from "../Entities/banner.entity";
import { CategoryEntity } from "../Entities/category.entity";
import { SizeEntity } from "../Entities/size.entity";
import { ProductPictureEntity } from "../Entities/product-pictures.entity";
import { BuyingHistoryEntity } from "../Entities/buyingHistory.entity";
import { ColorEntity } from "../Entities/colors.entity";
import { DeliveryStatusEntity } from "../Entities/deliveryStatus.entity";
import { SubCategoryEntity } from "../Entities/subCategory.entity";
import { CartsEntity } from "../Entities/cart.entity";
import { WishEntity } from "../Entities/wish.entity";
import { CouponEntity } from "../Entities/coupon.entity";
import { PaymentMethodEntity } from "../Entities/paymentMethod.entity";
import { SubSubCategoryEntity } from "../Entities/subSubCategory.entity";
import { ColorSizeEntity } from "../Entities/color-size-combined.entity";
import { PaymentInfo } from "../Entities/paymentInfo.entity";


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
                    pass: '' 
                },
            }
        }

        ),
        TypeOrmModule.forFeature([BannerEntity, BuyingHistoryEntity, CategoryEntity, ColorEntity, CartsEntity, ColorSizeEntity, CouponEntity, DeliveryStatusEntity, PaymentInfo, PaymentMethodEntity, ProductPictureEntity, ProductEntity, PartnerEntity, SizeEntity, SubCategoryEntity, SubSubCategoryEntity, WishEntity ])],
    controllers: [],
    providers: [],
})

export class GlobalModule { }