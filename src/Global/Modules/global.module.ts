/* eslint-disable prettier/prettier */
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../Entities/product.entity';
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
// import * as dotenv from 'dotenv';
import { FabricEntity } from '../Entities/fabrics.entity';
import { ProductSizeCategoryEntity } from '../Entities/productSizeCategory.entity';
import { OtpEntity } from '../Entities/otp.entity';
import { ViewProductEntity } from '../Entities/viewProduct.entity';
import { ReturnEntity } from '../Entities/return.entity';
import { GenderEntity } from '../Entities/gender.entity';
import { MessageEntity } from '../Entities/messages.entity';
import { UnreadMessageEntity } from '../Entities/unreadMessage.entity';
import { NewArrivalEntity } from '../Entities/new-arrival.entity';
import { PopUpEntity } from '../Entities/pop-up.entity';
import { ActivePopUpEntity } from '../Entities/active-pop-up.entity';
import { BlacklistToken } from '../Entities/blacklist-token.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomizationRequestEntity } from '../Entities/customization-request.entity';
import { CustomImgElement } from '../Entities/custom-img-element';
import { CustomTextElement } from '../Entities/custom-text-element';
import { CourierInfo } from '../Entities/courier-info.entity';
// Load environment variables
// dotenv.config();

@Module({
    imports: [
        ConfigModule,
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: 'smtp.gmail.com',
                    port: 465,
                    ignoreTLS: true,
                    secure: true,
                    auth: {
                        user: configService.get<string>('EMAIL_USER'),
                        pass: configService.get<string>('EMAIL_PASSWORD'),
                    },
                }
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([
            ActivePopUpEntity,
            BannerEntity,
            BlacklistToken,
            BuyingHistoryEntity,
            CategoryEntity,
            ColorEntity,
            CartsEntity,
            ColorSizeEntity,
            CouponEntity,
            CourierInfo,
            CustomizationRequestEntity,
            CustomImgElement,
            CustomTextElement,
            DeliveryStatusEntity,
            FabricEntity,
            GenderEntity,
            MessageEntity,
            NewArrivalEntity,
            OtpEntity,
            PaymentInfo,
            PaymentMethodEntity,
            PopUpEntity,
            ProductPictureEntity,
            ProductSizeCategoryEntity,
            ProductEntity,
            PartnerEntity,
            SizeEntity,
            ReturnEntity,
            SubCategoryEntity,
            SubSubCategoryEntity,
            UnreadMessageEntity,
            ViewProductEntity,
            WishEntity,
        ])],
    controllers: [],
    providers: [],
})

export class GlobalModule { } 