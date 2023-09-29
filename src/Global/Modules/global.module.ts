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
        TypeOrmModule.forFeature([BannerEntity, BuyingHistoryEntity, CategoryEntity, ColorEntity, DeliveryStatusEntity, ProductPictureEntity, ProductEntity, PartnerEntity, SizeEntity, SubCategoryEntity ])],
    controllers: [],
    providers: [],
})

export class GlobalModule { }