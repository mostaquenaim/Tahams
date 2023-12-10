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
exports.SubSubCategoryEntity = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./product.entity");
const subCategory_entity_1 = require("./subCategory.entity");
let SubSubCategoryEntity = exports.SubSubCategoryEntity = class SubSubCategoryEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubSubCategoryEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SubSubCategoryEntity.prototype, "categoryName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SubSubCategoryEntity.prototype, "filename", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => product_entity_1.ProductEntity, (product) => product.subCategories),
    __metadata("design:type", Array)
], SubSubCategoryEntity.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subCategory_entity_1.SubCategoryEntity, (category) => category.subSubs),
    __metadata("design:type", subCategory_entity_1.SubCategoryEntity)
], SubSubCategoryEntity.prototype, "category", void 0);
exports.SubSubCategoryEntity = SubSubCategoryEntity = __decorate([
    (0, typeorm_1.Entity)('sub-sub-category')
], SubSubCategoryEntity);
//# sourceMappingURL=subSubCategory.entity.js.map