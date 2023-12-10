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
exports.CouponEntity = void 0;
const typeorm_1 = require("typeorm");
const cart_entity_1 = require("./cart.entity");
let CouponEntity = exports.CouponEntity = class CouponEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CouponEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CouponEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "discountPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "discountMoney", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 10000 }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "limitAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "minimumSpent", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], CouponEntity.prototype, "isEnable", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => cart_entity_1.CartsEntity, (cart) => cart.coupon),
    __metadata("design:type", Array)
], CouponEntity.prototype, "carts", void 0);
exports.CouponEntity = CouponEntity = __decorate([
    (0, typeorm_1.Entity)('coupons')
], CouponEntity);
//# sourceMappingURL=coupon.entity.js.map