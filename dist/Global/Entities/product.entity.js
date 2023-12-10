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
exports.ProductEntity = void 0;
const typeorm_1 = require("typeorm");
const colors_entity_1 = require("./colors.entity");
const cart_entity_1 = require("./cart.entity");
const wish_entity_1 = require("./wish.entity");
const subSubCategory_entity_1 = require("./subSubCategory.entity");
const product_pictures_entity_1 = require("./product-pictures.entity");
let ProductEntity = exports.ProductEntity = class ProductEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProductEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProductEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProductEntity.prototype, "serialNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ProductEntity.prototype, "purchaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "vatPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "discountPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "buyingPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ProductEntity.prototype, "sellingPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProductEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ProductEntity.prototype, "ifStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductEntity.prototype, "filename", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => subSubCategory_entity_1.SubSubCategoryEntity, (subCategory) => subCategory.products),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], ProductEntity.prototype, "subCategories", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => colors_entity_1.ColorEntity, (color) => color.product),
    __metadata("design:type", Array)
], ProductEntity.prototype, "colors", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_pictures_entity_1.ProductPictureEntity, (productPicture) => productPicture.product),
    __metadata("design:type", Array)
], ProductEntity.prototype, "productPictures", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => cart_entity_1.CartsEntity, (cart) => cart.product),
    __metadata("design:type", Array)
], ProductEntity.prototype, "carts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => wish_entity_1.WishEntity, (wish) => wish.product),
    __metadata("design:type", Array)
], ProductEntity.prototype, "wishes", void 0);
exports.ProductEntity = ProductEntity = __decorate([
    (0, typeorm_1.Entity)('product')
], ProductEntity);
//# sourceMappingURL=product.entity.js.map