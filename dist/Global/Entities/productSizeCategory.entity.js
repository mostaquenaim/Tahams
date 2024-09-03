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
exports.ProductSizeCategoryEntity = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./product.entity");
const size_entity_1 = require("./size.entity");
const subSubCategory_entity_1 = require("./subSubCategory.entity");
let ProductSizeCategoryEntity = exports.ProductSizeCategoryEntity = class ProductSizeCategoryEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProductSizeCategoryEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.ProductEntity, (product) => product.pscs),
    __metadata("design:type", product_entity_1.ProductEntity)
], ProductSizeCategoryEntity.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subSubCategory_entity_1.SubSubCategoryEntity, (category) => category.pscs),
    __metadata("design:type", subSubCategory_entity_1.SubSubCategoryEntity)
], ProductSizeCategoryEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => size_entity_1.SizeEntity, (size) => size.pscs),
    __metadata("design:type", size_entity_1.SizeEntity)
], ProductSizeCategoryEntity.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ProductSizeCategoryEntity.prototype, "quantity", void 0);
exports.ProductSizeCategoryEntity = ProductSizeCategoryEntity = __decorate([
    (0, typeorm_1.Entity)('product_size_category')
], ProductSizeCategoryEntity);
//# sourceMappingURL=productSizeCategory.entity.js.map