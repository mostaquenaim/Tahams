"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartsEntity = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const product_entity_1 = require("./product.entity");
const buyingHistory_entity_1 = require("./buyingHistory.entity");
const coupon_entity_1 = require("./coupon.entity");
const subSubCategory_entity_1 = require("./subSubCategory.entity");
let CartsEntity = exports.CartsEntity = class CartsEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CartsEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CartsEntity.prototype, "uniqueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CartsEntity.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CartsEntity.prototype, "Quantity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CartsEntity.prototype, "ProductName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], CartsEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CartsEntity.prototype, "isBought", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], CartsEntity.prototype, "totalPrice", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subSubCategory_entity_1.SubSubCategoryEntity, (category) => category.carts),
    __metadata("design:type", subSubCategory_entity_1.SubSubCategoryEntity)
], CartsEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, (customer) => customer.carts),
    __metadata("design:type", user_entity_1.UserEntity)
], CartsEntity.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.ProductEntity, (product) => product.carts),
    __metadata("design:type", product_entity_1.ProductEntity)
], CartsEntity.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => coupon_entity_1.CouponEntity, (coupon) => coupon.carts, { nullable: true }),
    __metadata("design:type", coupon_entity_1.CouponEntity)
], CartsEntity.prototype, "coupon", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => buyingHistory_entity_1.BuyingHistoryEntity, (history) => history.carts, { nullable: true }),
    __metadata("design:type", buyingHistory_entity_1.BuyingHistoryEntity)
], CartsEntity.prototype, "history", void 0);
exports.CartsEntity = CartsEntity = __decorate([
    (0, typeorm_1.Entity)('cart')
], CartsEntity);
//# sourceMappingURL=cart.entity.js.map