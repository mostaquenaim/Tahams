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
const path_1 = require("path");
let AdminController = exports.AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async signIn(myDto) {
        const res = await (this.adminService.signIn(myDto));
        return res;
    }
    async checkEmail(email) {
        return await this.adminService.checkEmail(email);
    }
    async customerLogin(myDto) {
        const response = await this.adminService.customerLogin(myDto);
        return response;
    }
    sendEmail(mydata) {
        return this.adminService.sendEmail(mydata);
    }
    async sendOtp(sendOtpDto) {
        const result = await this.adminService.checkEmailAndSendOTP(sendOtpDto.email);
        return result;
    }
    async verifyOtp(verifyOtpDto) {
        return await this.adminService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
    }
    addBanner(myDto, file) {
        myDto.filename = file.filename;
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
    async publishProduct(id, publishable) {
        return this.adminService.publishProduct(id, publishable);
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
    async getBuyingHistoryByToken(token, email) {
        const result = await this.adminService.getBuyingHistoryByToken(token, email);
        return result;
    }
    addPaymentInfo(PaymentDetails, file) {
        PaymentDetails.screenshot = file?.filename;
        return this.adminService.addPaymentInfo(PaymentDetails);
    }
    getAllBuyingHistories(email) {
        return this.adminService.getAllBuyingHistories(email);
    }
    async createNewCart(myDto) {
        const response = await this.adminService.createNewCart(myDto);
        return response;
    }
    deleteCartItem(id, email) {
        return this.adminService.deleteCartItem(id);
    }
    deleteCarts(myDto) {
        return this.adminService.deleteCarts(myDto.checkedItems);
    }
    getAllCarts(email) {
        return this.adminService.getAllCarts(email);
    }
    async viewProductCategories() {
        const result = await this.adminService.viewProductCategories();
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
    async viewFabrics() {
        const result = await this.adminService.viewFabrics();
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
    checkIfWished(productId, customerId) {
        return this.adminService.checkIfWished(productId, customerId);
    }
    getSubCatById(id) {
        return this.adminService.getSubSubCategoryById(id);
    }
    getProductFtImage(id) {
        return this.adminService.getProductFtImage(id);
    }
    getCategoryById(id) {
        return this.adminService.getCategoryByName(id);
    }
    getProductByCat(name) {
        return this.adminService.getProductByCat(name);
    }
    getProductBySubSubCatId(id) {
        return this.adminService.getPublishableProductsBySubSubCatId(id);
    }
    getUserByEmail(email) {
        return this.adminService.getUserByEmail(email);
    }
    async updateCategory(id, myDto) {
        await this.adminService.updateCategory(id, myDto);
    }
    async updateUserAddress(id, updateAddressDto) {
        return this.adminService.updateUserAddress(id, updateAddressDto);
    }
    createNewCategory(myDto) {
        return this.adminService.createNewCategory(myDto);
    }
    createPaymentMethod(myDto) {
        return this.adminService.createPaymentMethod(myDto);
    }
    increaseProductView(id, email) {
        return this.adminService.increaseProductView(id, email);
    }
    createNewSubCategory(myDto) {
        return this.adminService.createNewSubCategory(myDto);
    }
    createNewSubSubCategory(myDto) {
        return this.adminService.createNewSubSubCategory(myDto);
    }
    changeCategoryImage(id, file) {
        return this.adminService.changeCategoryImage(id, file.filename);
    }
    createNewCoupon(myDto) {
        return this.adminService.createNewCoupon(myDto);
    }
    createNewColor(myDto) {
        return this.adminService.createNewColor(myDto);
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
    logout(session) {
        if (session) {
            session.destroy();
            return { message: "you are logged out successfully" };
        }
        else {
            throw new common_1.UnauthorizedException("Can't log out");
        }
    }
    createUser(myDto) {
        return this.adminService.createUser(myDto);
    }
    viewAllProducts(query) {
        return this.adminService.viewAllProducts(query);
    }
    viewProductSizes() {
        return this.adminService.viewProductSizes();
    }
    async getProductById(id) {
        const result = await this.adminService.getProductById(id);
        return result;
    }
    async deleteProductById(id) {
        console.log(id);
        return this.adminService.deleteProductById(id);
    }
    async deleteSizeById(id) {
        return this.adminService.deleteSizeById(id);
    }
    async removeWish(myDto) {
        return this.adminService.removeWish(myDto);
    }
    createNewSize(myDto) {
        return this.adminService.createNewSize(myDto);
    }
    createNewFabric(myDto) {
        return this.adminService.createNewFabric(myDto);
    }
    addProductFunc(mydata, imageobj) {
        mydata.filename = imageobj.filename;
        return this.adminService.createNewProduct(mydata);
    }
    async addProductPictures(files, mydata) {
        const filenames = files.map(file => file.filename);
        mydata.filenames = filenames;
        return this.adminService.addProductPictures(mydata);
    }
    updateAdmin(myDto, file) {
        return this.adminService.updateAdmin(myDto, myDto.email);
    }
    createNewWish(myDto) {
        return this.adminService.createNewWish(myDto);
    }
    async getWishByUser(email) {
        const res = await this.adminService.getWishByUser(email);
        return res;
    }
    getImages(name, res) {
        res.sendFile(name, { root: './uploads' });
    }
};
__decorate([
    (0, common_1.Post)('/signin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "signIn", null);
__decorate([
    (0, common_1.Get)('/check-email'),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "checkEmail", null);
__decorate([
    (0, common_1.Post)('customer-login'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "customerLogin", null);
__decorate([
    (0, common_1.Post)('sendemail'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "sendEmail", null);
__decorate([
    (0, common_1.Post)('send-otp'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "sendOtp", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "verifyOtp", null);
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
    (0, common_1.Put)('publish-product/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('publishable')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Boolean]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "publishProduct", null);
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
    (0, common_1.Get)('get-buying-history-by-token/:token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBuyingHistoryByToken", null);
__decorate([
    (0, common_1.Post)('/add-payment'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('screenshot', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: function (req, file, cb) {
                cb(null, Date.now() + file.originalname);
            }
        })
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "addPaymentInfo", null);
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
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createNewCart", null);
__decorate([
    (0, common_1.Delete)('delete-cart/:uniqueId'),
    __param(0, (0, common_1.Param)('uniqueId')),
    __param(1, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteCartItem", null);
__decorate([
    (0, common_1.Delete)('delete-carts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
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
    (0, common_1.Get)('view-fabrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "viewFabrics", null);
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
    (0, common_1.Get)('check-wish-by-user-and-product'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "checkIfWished", null);
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
    (0, common_1.Get)('get-product-by-cat/:name'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getProductByCat", null);
__decorate([
    (0, common_1.Get)('get-product-by-sub-sub-cat/:id'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getProductBySubSubCatId", null);
__decorate([
    (0, common_1.Get)('get-user-by-email/:email'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUserByEmail", null);
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
    (0, common_1.Put)('update-user-address/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserAddress", null);
__decorate([
    (0, common_1.Post)('add-category'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createNewCategory", null);
__decorate([
    (0, common_1.Post)('add-payment-method'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createPaymentMethod", null);
__decorate([
    (0, common_1.Post)('increase-product-view/:id'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "increaseProductView", null);
__decorate([
    (0, common_1.Post)('add-subCategory'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createNewSubCategory", null);
__decorate([
    (0, common_1.Post)('add-sub-subCategory'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createNewSubSubCategory", null);
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
    (0, common_1.Post)('add-color'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createNewColor", null);
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
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)('view-all-products'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "viewAllProducts", null);
__decorate([
    (0, common_1.Get)('view-product-sizes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "viewProductSizes", null);
__decorate([
    (0, common_1.Get)('get-product-by-id/:id'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getProductById", null);
__decorate([
    (0, common_1.Delete)('delete-product/:id'),
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
    (0, common_1.Delete)('remove-wish'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "removeWish", null);
__decorate([
    (0, common_1.Post)('add-size'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createNewSize", null);
__decorate([
    (0, common_1.Post)('add-fabric'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createNewFabric", null);
__decorate([
    (0, common_1.Post)('/add-product'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('myfile', {
        fileFilter: (req, file, cb) => {
            if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg|gif)$/))
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
    (0, common_1.Post)('/add-product-pictures'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('myfiles', 10, {
        fileFilter: (req, file, cb) => {
            if (file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                cb(null, true);
            }
            else {
                cb(new Error('Unsupported file type'), false);
            }
        },
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "addProductPictures", null);
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
    (0, common_1.Post)('add-Wish'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createNewWish", null);
__decorate([
    (0, common_1.Get)('get-wish-by-user/:email'),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getWishByUser", null);
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