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
exports.BuyingHistoryEntity = void 0;
const typeorm_1 = require("typeorm");
const deliveryStatus_entity_1 = require("./deliveryStatus.entity");
const cart_entity_1 = require("./cart.entity");
const paymentMethod_entity_1 = require("./paymentMethod.entity");
let BuyingHistoryEntity = exports.BuyingHistoryEntity = class BuyingHistoryEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BuyingHistoryEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BuyingHistoryEntity.prototype, "trackingToken", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BuyingHistoryEntity.prototype, "Address", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BuyingHistoryEntity.prototype, "phone_no", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], BuyingHistoryEntity.prototype, "BuyingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BuyingHistoryEntity.prototype, "PaymentDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], BuyingHistoryEntity.prototype, "PaymentDone", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => deliveryStatus_entity_1.DeliveryStatusEntity, (deliveryStatus) => deliveryStatus.buyingHistories),
    __metadata("design:type", deliveryStatus_entity_1.DeliveryStatusEntity)
], BuyingHistoryEntity.prototype, "deliveryStatus", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => paymentMethod_entity_1.PaymentMethodEntity, (paymentMethod) => paymentMethod.buyingHistories),
    __metadata("design:type", paymentMethod_entity_1.PaymentMethodEntity)
], BuyingHistoryEntity.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => cart_entity_1.CartsEntity, (cart) => cart.history),
    __metadata("design:type", Array)
], BuyingHistoryEntity.prototype, "carts", void 0);
exports.BuyingHistoryEntity = BuyingHistoryEntity = __decorate([
    (0, typeorm_1.Entity)('buying-history')
], BuyingHistoryEntity);
//# sourceMappingURL=buyingHistory.entity.js.map