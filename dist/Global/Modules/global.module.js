"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalModule = void 0;
const mailer_1 = require("@nestjs-modules/mailer");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const product_entity_1 = require("../Entities/product.entity");
const partner_entity_1 = require("../Entities/partner.entity");
const banner_entity_1 = require("../Entities/banner.entity");
const category_entity_1 = require("../Entities/category.entity");
const size_entity_1 = require("../Entities/size.entity");
const product_pictures_entity_1 = require("../Entities/product-pictures.entity");
const buyingHistory_entity_1 = require("../Entities/buyingHistory.entity");
const colors_entity_1 = require("../Entities/colors.entity");
const deliveryStatus_entity_1 = require("../Entities/deliveryStatus.entity");
const subCategory_entity_1 = require("../Entities/subCategory.entity");
const cart_entity_1 = require("../Entities/cart.entity");
const wish_entity_1 = require("../Entities/wish.entity");
const coupon_entity_1 = require("../Entities/coupon.entity");
const paymentMethod_entity_1 = require("../Entities/paymentMethod.entity");
const subSubCategory_entity_1 = require("../Entities/subSubCategory.entity");
const color_size_combined_entity_1 = require("../Entities/color-size-combined.entity");
const paymentInfo_entity_1 = require("../Entities/paymentInfo.entity");
let GlobalModule = exports.GlobalModule = class GlobalModule {
};
exports.GlobalModule = GlobalModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mailer_1.MailerModule.forRoot({
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
            }),
            typeorm_1.TypeOrmModule.forFeature([
                banner_entity_1.BannerEntity,
                buyingHistory_entity_1.BuyingHistoryEntity,
                category_entity_1.CategoryEntity,
                colors_entity_1.ColorEntity,
                cart_entity_1.CartsEntity,
                color_size_combined_entity_1.ColorSizeEntity,
                coupon_entity_1.CouponEntity,
                deliveryStatus_entity_1.DeliveryStatusEntity,
                paymentInfo_entity_1.PaymentInfo,
                paymentMethod_entity_1.PaymentMethodEntity,
                product_pictures_entity_1.ProductPictureEntity,
                product_entity_1.ProductEntity,
                partner_entity_1.PartnerEntity,
                size_entity_1.SizeEntity,
                subCategory_entity_1.SubCategoryEntity,
                subSubCategory_entity_1.SubSubCategoryEntity,
                wish_entity_1.WishEntity,
            ])
        ],
        controllers: [],
        providers: [],
    })
], GlobalModule);
//# sourceMappingURL=global.module.js.map