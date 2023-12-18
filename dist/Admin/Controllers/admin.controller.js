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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("../Services/admin.service");
const adminform_dto_1 = require("../DTOs/adminform.dto");
const multer_1 = require("multer");
const platform_express_1 = require("@nestjs/platform-express");
const couponform_dto_1 = require("../../Global/DTOs/couponform.dto");
let AdminController = exports.AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async signIn(session, myDto) {
        const res = await (this.adminService.signIn(myDto));
        if (res == true) {
            session.email = myDto.email;
            return (session.email);
        }
        else {
            throw new common_1.UnauthorizedException({ message: "invalid" });
        }
    }
    addBanner(myDto, file) {
        myDto.filename = file.filename;
        console.log(myDto);
        return this.adminService.addBanner(myDto);
    }
    viewAllBanners() {
        return this.adminService.viewAllBanners();
    }
    viewBannerById(id) {
        return this.adminService.getBannerById(id);
    }
    async deleteBanner(id) {
        return this.adminService.deleteBanner(id);
    }
    async updateBanner(id, myDto) {
        await this.adminService.updateBanner(id, myDto);
    }
    changeBannerImage(id, file) {
        return this.adminService.changeBannerImage(id, file.filename);
    }
    createNewBuy(myDto) {
        return this.adminService.createNewBuy(myDto);
    }
    updateBuyingHistory(id, email, details) {
        return this.adminService.updateBuyingHistory(id, details, email);
    }
    getBuyingHistoryById(id) {
        return this.adminService.getBuyingHistoryById(id);
    }
    getAllBuyingHistories(email) {
        return this.adminService.getAllBuyingHistories(email);
    }
    createNewCart(myDto) {
        return this.adminService.createNewCart(myDto);
    }
    deleteCartItem(id, email) {
        return this.adminService.deleteCartItem(id);
    }
    deleteCarts(email, cartArray) {
        return this.adminService.deleteCarts(cartArray, email);
    }
    getAllCarts(email) {
        return this.adminService.getAllCarts(email);
    }
    async viewProductCategories() {
        const result = await this.adminService.viewProductCategories();
        console.log(result);
        return result;
    }
    async viewAllProductSubSubCategories() {
        const result = await this.adminService.viewAllProductSubSubCategories();
        return result;
    }
    async viewColors() {
        const result = await this.adminService.viewColors();
        return result;
    }
    async viewAllProductSubCategories() {
        const result = await this.adminService.viewAllProductSubCategories();
        return result;
    }
    viewProductSubCategories(id) {
        return this.adminService.viewProductSubCategories(id);
    }
    viewProductSubSubCategories(catId) {
        return this.adminService.viewProductSubSubCategories(catId);
    }
    getSubCatById(id) {
        return this.adminService.getSubSubCategoryById(id);
    }
    getProductFtImage(id) {
        return this.adminService.getProductFtImage(id);
    }
    getCategoryById(id) {
        return this.adminService.getCategoryById(id);
    }
    getProductByCatId(id) {
        return this.adminService.getProductByCatId(id);
    }
    getProductBySubSubCatId(id) {
        return this.adminService.getProductBySubSubCatId(id);
    }
    async updateCategory(id, myDto) {
        await this.adminService.updateCategory(id, myDto);
    }
    createNewCategory(myDto) {
        return this.adminService.createNewCategory(myDto);
    }
    createNewSubCategory(myDto) {
        return this.adminService.createNewSubCategory(myDto);
    }
    changeCategoryImage(id, file) {
        return this.adminService.changeCategoryImage(id, file.filename);
    }
    createNewCoupon(myDto) {
        return this.adminService.createNewCoupon(myDto);
    }
    getAllCoupons() {
        return this.adminService.getAllCoupons();
    }
    getParticularCoupon(id) {
        return this.adminService.getParticularCoupon(id);
    }
    disableCoupon(id) {
        return this.adminService.disableCoupon(id);
    }
    getAllDeliveryStatus() {
        return this.adminService.getAllDeliveryStatus();
    }
    getAllPaymentMethod() {
        return this.adminService.getAllPaymentMethod();
    }
    sendEmail(mydata) {
        return this.adminService.sendEmail(mydata);
    }
    logout(session) {
        if (session) {
            session.destroy();
            return { message: "you are logged out successfully" };
        }
        else {
            throw new common_1.UnauthorizedException("Can't log out");
        }
    }
    createUser(createUser) {
        return this.adminService.createUser(createUser);
    }
    viewAllProduct() {
        return this.adminService.viewAllProduct();
    }
    viewProductSizes() {
        return this.adminService.viewProductSizes();
    }
    getProductById(id) {
        return this.adminService.getProductById(id);
    }
    async deleteProductById(id) {
        return this.adminService.deleteProductById(id);
    }
    async deleteSizeById(id) {
        return this.adminService.deleteSizeById(id);
    }
    createNewSize(id, session, myDto) {
        return this.adminService.createNewSize(myDto);
    }
    addProductFunc(mydata, imageobj) {
        console.log(mydata);
        console.log(imageobj.filename);
        mydata.filename = imageobj.filename;
        return this.adminService.createNewProduct(mydata);
    }
    updateAdmin(myDto, file) {
        return this.adminService.updateAdmin(myDto, myDto.email);
    }
    createNewWish(myDto) {
        console.log("myDto", myDto);
        return this.adminService.createNewWish(myDto);
    }
    getImages(name, res) {
        res.sendFile(name, { root: './uploads' });
    }
};
__decorate([
    (0, common_1.Post)('/signin'),
    __param(0, (0, common_1.Session)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, adminform_dto_1.AdminForm]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "signIn", null);
__decorate([
    (0, common_1.Post)('add-banner'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('filename', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: function (req, file, cb) {
                cb(null, Date.now() + file.originalname);
            }
        })
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 160000 }),
            new common_1.FileTypeValidator({ fileType: 'png|jpg|jpeg|' }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "addBanner", null);
__decorate([
    (0, common_1.Get)('all-banners'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "viewAllBanners", null);
__decorate([
    (0, common_1.Get)('banner-by-id/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "viewBannerById", null);
__decorate([
    (0, common_1.Delete)('deleteBanner/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteBanner", null);
__decorate([
    (0, common_1.Put)('updateBanner/:id'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateBanner", null);
__decorate([
    (0, common_1.Post)(('changeBannerImage/:id')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('filename', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: function (req, file, cb) {
                cb(null, Date.now() + file.originalname);
            }
        })
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Object)
], AdminController.prototype, "changeBannerImage", null);
__decorate([
    (0, common_1.Post)('add-to-buy'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createNewBuy", null);
__decorate([
    (0, common_1.Patch)('update-buy-reference/:token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Query)('email')),
    __param(2, (0, common_1.Body)('PaymentDetails')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateBuyingHistory", null);
__decorate([
    (0, common_1.Get)('get-buying-history-by-id/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getBuyingHistoryById", null);
__decorate([
    (0, common_1.Get)('get-all-buying-history'),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllBuyingHistories", null);
__decorate([
    (0, common_1.Post)('add-to-cart'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createNewCart", null);
__decorate([
    (0, common_1.Delete)('delete-cart/:uniqueId'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteCartItem", null);
__decorate([
    (0, common_1.Delete)('delete-carts'),
    __param(0, (0, common_1.Query)('email')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteCarts", null);
__decorate([
    (0, common_1.Get)('get-all-carts'),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllCarts", null);
__decorate([
    (0, common_1.Get)('view-product-categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "viewProductCategories", null);
__decorate([
    (0, common_1.Get)('view-product-sub-sub-categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "viewAllProductSubSubCategories", null);
__decorate([
    (0, common_1.Get)('view-colors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "viewColors", null);
__decorate([
    (0, common_1.Get)('view-product-sub-categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "viewAllProductSubCategories", null);
__decorate([
    (0, common_1.Get)('view-product-sub-category/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "viewProductSubCategories", null);
__decorate([
    (0, common_1.Get)('view-product-sub-sub-category/:catId'),
    __param(0, (0, common_1.Param)('catId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "viewProductSubSubCategories", null);
__decorate([
    (0, common_1.Get)('get-sub-sub-cat-by-id/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSubCatById", null);
__decorate([
    (0, common_1.Get)('get-ft-photo-by-product-id/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getProductFtImage", null);
__decorate([
    (0, common_1.Get)('getCategoryById/:id'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getCategoryById", null);
__decorate([
    (0, common_1.Get)('getProductByCat/:id'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getProductByCatId", null);
__decorate([
    (0, common_1.Get)('get-product-by-sub-sub-cat/:id'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getProductBySubSubCatId", null);
__decorate([
    (0, common_1.Put)('updateCategory/:id'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Post)('addCategory'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createNewCategory", null);
__decorate([
    (0, common_1.Post)('addSubCategory'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createNewSubCategory", null);
__decorate([
    (0, common_1.Post)(('changeCategoryImage/:id')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('filename', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: function (req, file, cb) {
                cb(null, Date.now() + file.originalname);
            }
        })
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Object)
], AdminController.prototype, "changeCategoryImage", null);
__decorate([
    (0, common_1.Post)('add-coupon'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [couponform_dto_1.default]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createNewCoupon", null);
__decorate([
    (0, common_1.Get)('get-coupons'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllCoupons", null);
__decorate([
    (0, common_1.Get)('get-coupons/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getParticularCoupon", null);
__decorate([
    (0, common_1.Patch)('disable-coupon/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "disableCoupon", null);
__decorate([
    (0, common_1.Get)('get-all-delivery-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllDeliveryStatus", null);
__decorate([
    (0, common_1.Get)('get-all-payment-methods'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllPaymentMethod", null);
__decorate([
    (0, common_1.Post)('sendemail'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "sendEmail", null);
__decorate([
    (0, common_1.Get)('/logout'),
    __param(0, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [adminform_dto_1.AdminForm]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)('view-all-products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "viewAllProduct", null);
__decorate([
    (0, common_1.Get)('view-product-sizes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "viewProductSizes", null);
__decorate([
    (0, common_1.Get)('getProductById/:id'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getProductById", null);
__decorate([
    (0, common_1.Delete)('deleteProduct/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteProductById", null);
__decorate([
    (0, common_1.Delete)('deleteSize/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteSizeById", null);
__decorate([
    (0, common_1.Post)('addSize'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Session)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createNewSize", null);
__decorate([
    (0, common_1.Post)('/add-product'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('myfile', {
        fileFilter: (req, file, cb) => {
            if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
                cb(null, true);
            else {
                cb(new multer_1.MulterError('LIMIT_UNEXPECTED_FILE', 'myfile'), false);
            }
        },
        limits: { fileSize: 30000000 },
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: function (req, file, cb) {
                cb(null, Date.now() + file.originalname);
            },
        })
    })),
    (0, common_1.UsePipes)(new common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "addProductFunc", null);
__decorate([
    (0, common_1.Put)('/updateProfile'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('filename', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: function (req, file, cb) {
                cb(null, Date.now() + file.originalname);
            }
        })
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 160000 }),
            new common_1.FileTypeValidator({ fileType: 'png|jpg|jpeg|' }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [adminform_dto_1.AdminForm, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateAdmin", null);
__decorate([
    (0, common_1.Post)('addWish'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createNewWish", null);
__decorate([
    (0, common_1.Get)('/getimage/:name'),
    __param(0, (0, common_1.Param)('name')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getImages", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map