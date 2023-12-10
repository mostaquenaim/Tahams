"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const mailer_1 = require("@nestjs-modules/mailer");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const admin_controller_1 = require("../Controllers/admin.controller");
const admin_entity_1 = require("../Entities/admin.entity");
const admin_service_1 = require("../Services/admin.service");
const customer_entity_1 = require("../../Customer/Entities/customer.entity");
const product_entity_1 = require("../../Global/Entities/product.entity");
const banner_entity_1 = require("../../Global/Entities/banner.entity");
const category_entity_1 = require("../../Global/Entities/category.entity");
const size_entity_1 = require("../../Global/Entities/size.entity");
const buyingHistory_entity_1 = require("../../Global/Entities/buyingHistory.entity");
const colors_entity_1 = require("../../Global/Entities/colors.entity");
const cart_entity_1 = require("../../Global/Entities/cart.entity");
const coupon_entity_1 = require("../../Global/Entities/coupon.entity");
const deliveryStatus_entity_1 = require("../../Global/Entities/deliveryStatus.entity");
const product_pictures_entity_1 = require("../../Global/Entities/product-pictures.entity");
const partner_entity_1 = require("../../Global/Entities/partner.entity");
const subCategory_entity_1 = require("../../Global/Entities/subCategory.entity");
const wish_entity_1 = require("../../Global/Entities/wish.entity");
const employee_entity_1 = require("../../Employee/Entities/employee.entity");
const paymentMethod_entity_1 = require("../../Global/Entities/paymentMethod.entity");
const subSubCategory_entity_1 = require("../../Global/Entities/subSubCategory.entity");
const color_size_combined_entity_1 = require("../../Global/Entities/color-size-combined.entity");
let AdminModule = exports.AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule = __decorate([
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
            typeorm_1.TypeOrmModule.forFeature([admin_entity_1.AdminEntity, banner_entity_1.BannerEntity, buyingHistory_entity_1.BuyingHistoryEntity, category_entity_1.CategoryEntity, color_size_combined_entity_1.ColorSizeEntity, customer_entity_1.CustomerEntity, colors_entity_1.ColorEntity, cart_entity_1.CartsEntity, coupon_entity_1.CouponEntity, deliveryStatus_entity_1.DeliveryStatusEntity, employee_entity_1.EmployeeEntity, paymentMethod_entity_1.PaymentMethodEntity, product_pictures_entity_1.ProductPictureEntity, product_entity_1.ProductEntity, partner_entity_1.PartnerEntity, size_entity_1.SizeEntity, subCategory_entity_1.SubCategoryEntity, subSubCategory_entity_1.SubSubCategoryEntity, wish_entity_1.WishEntity])
        ],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService],
    })
], AdminModule);
//# sourceMappingURL=adminModule.module.js.map