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
exports.SubCategoryEntity = void 0;
const typeorm_1 = require("typeorm");
const category_entity_1 = require("./category.entity");
const subSubCategory_entity_1 = require("./subSubCategory.entity");
let SubCategoryEntity = exports.SubCategoryEntity = class SubCategoryEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubCategoryEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SubCategoryEntity.prototype, "categoryName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SubCategoryEntity.prototype, "filename", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.CategoryEntity, (category) => category.subs),
    __metadata("design:type", category_entity_1.CategoryEntity)
], SubCategoryEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subSubCategory_entity_1.SubSubCategoryEntity, (subSubs) => subSubs.category),
    __metadata("design:type", subSubCategory_entity_1.SubSubCategoryEntity)
], SubCategoryEntity.prototype, "subSubs", void 0);
exports.SubCategoryEntity = SubCategoryEntity = __decorate([
    (0, typeorm_1.Entity)('sub-category')
], SubCategoryEntity);
//# sourceMappingURL=subCategory.entity.js.map