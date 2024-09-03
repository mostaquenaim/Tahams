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
exports.PaymentInfo = void 0;
const typeorm_1 = require("typeorm");
const buyingHistory_entity_1 = require("./buyingHistory.entity");
let PaymentInfo = exports.PaymentInfo = class PaymentInfo {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PaymentInfo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaymentInfo.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaymentInfo.prototype, "accountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaymentInfo.prototype, "mobileNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaymentInfo.prototype, "screenshot", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => buyingHistory_entity_1.BuyingHistoryEntity),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", buyingHistory_entity_1.BuyingHistoryEntity)
], PaymentInfo.prototype, "buyingHistory", void 0);
exports.PaymentInfo = PaymentInfo = __decorate([
    (0, typeorm_1.Entity)('payment-info')
], PaymentInfo);
//# sourceMappingURL=paymentInfo.entity.js.map