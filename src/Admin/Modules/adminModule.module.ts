/* eslint-disable prettier/prettier */
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
import { ViewProductEntity } from "src/Global/Entities/viewProduct.entity";
import { ReturnEntity } from "src/Global/Entities/return.entity";
import { GenderEntity } from "src/Global/Entities/gender.entity";
import { UnreadMessageEntity } from "src/Global/Entities/unreadMessage.entity";
import { MessageEntity } from "src/Global/Entities/messages.entity";
import { NewArrivalEntity } from "src/Global/Entities/new-arrival.entity";
import { PopUpEntity } from "src/Global/Entities/pop-up.entity";
import { ActivePopUpEntity } from "src/Global/Entities/active-pop-up.entity";
import { JwtModule } from "@nestjs/jwt";
import { BlacklistToken } from "src/Global/Entities/blacklist-token.entity";
import { PassportModule } from "@nestjs/passport";
import { RolesGuard } from "../Guards/roles.guard";
import { OrderAccessGuard } from "../Guards/order-access.guard";
import { FirebaseAuthGuard } from "../Guards/firebase-auth.guard";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "../strategies/jwt.strategy";
import { RoleEntity } from "src/Global/Entities/roles.entity";
import { CustomizationRequestEntity } from "src/Global/Entities/customization-request.entity";
import { CustomImgElement } from "src/Global/Entities/custom-img-element";
import { CustomTextElement } from "src/Global/Entities/custom-text-element";
import { CourierInfo } from "src/Global/Entities/courier-info.entity";
import { ActivityEntity } from "src/Global/Entities/activity.entity";
import { CustomerActivityEntity } from "src/Global/Entities/customer-activity.entity";
// dotenv.config();

@Module({
    imports: [
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '7d' },
            }),
            inject: [ConfigService],
        }),

        TypeOrmModule.forFeature([
            ActivePopUpEntity,
            ActivityEntity,
            AdminEntity,
            BannerEntity,
            BlacklistToken,
            BuyingHistoryEntity,
            CategoryEntity,
            ColorSizeEntity,
            ColorEntity,
            CourierInfo,
            CartsEntity,
            CouponEntity,
            CustomizationRequestEntity,
            CustomImgElement,
            CustomTextElement,
            CustomerActivityEntity,
            DeliveryStatusEntity,
            EmployeeEntity,
            FabricEntity,
            GenderEntity,
            MessageEntity,
            NewArrivalEntity,
            OtpEntity,
            PaymentInfo,
            PaymentMethodEntity,
            PopUpEntity,
            ProductPictureEntity,
            ProductEntity,
            ProductSizeCategoryEntity,
            PartnerEntity,
            ReturnEntity,
            RoleEntity,
            SizeEntity,
            SubCategoryEntity,
            SubSubCategoryEntity,
            UserEntity,
            UnreadMessageEntity,
            ViewProductEntity,
            WishEntity,
        ])],
    controllers: [
        AdminController
    ],
    providers: [
        AdminService,
        JwtStrategy,
        RolesGuard,
        OrderAccessGuard,
        FirebaseAuthGuard,
        ConfigService
    ],
})

export class AdminModule { }