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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const typeorm_3 = require("typeorm");
const admin_entity_1 = require("../Entities/admin.entity");
const customer_entity_1 = require("../../Customer/Entities/customer.entity");
const product_entity_1 = require("../../Global/Entities/product.entity");
const banner_entity_1 = require("../../Global/Entities/banner.entity");
const bcrypt = require("bcrypt");
const dist_1 = require("@nestjs-modules/mailer/dist");
const category_entity_1 = require("../../Global/Entities/category.entity");
const size_entity_1 = require("../../Global/Entities/size.entity");
const subCategory_entity_1 = require("../../Global/Entities/subCategory.entity");
const coupon_entity_1 = require("../../Global/Entities/coupon.entity");
const colors_entity_1 = require("../../Global/Entities/colors.entity");
const product_pictures_entity_1 = require("../../Global/Entities/product-pictures.entity");
const wish_entity_1 = require("../../Global/Entities/wish.entity");
const cart_entity_1 = require("../../Global/Entities/cart.entity");
const buyingHistory_entity_1 = require("../../Global/Entities/buyingHistory.entity");
const deliveryStatus_entity_1 = require("../../Global/Entities/deliveryStatus.entity");
const paymentMethod_entity_1 = require("../../Global/Entities/paymentMethod.entity");
const uuid_1 = require("uuid");
const subSubCategory_entity_1 = require("../../Global/Entities/subSubCategory.entity");
const color_size_combined_entity_1 = require("../../Global/Entities/color-size-combined.entity");
let AdminService = exports.AdminService = class AdminService {
    constructor(adminRepo, mailerService, customerRepo, productRepo, productPicRepo, bannerRepo, categoryRepo, couponRepo, colorRepo, subCategoryRepo, subSubCategoryRepo, sizeRepo, wishRepo, cartRepo, buyingHistoryRepo, deliveryStatusRepo, paymentMethodRepo, colorSizeRepo) {
        this.adminRepo = adminRepo;
        this.mailerService = mailerService;
        this.customerRepo = customerRepo;
        this.productRepo = productRepo;
        this.productPicRepo = productPicRepo;
        this.bannerRepo = bannerRepo;
        this.categoryRepo = categoryRepo;
        this.couponRepo = couponRepo;
        this.colorRepo = colorRepo;
        this.subCategoryRepo = subCategoryRepo;
        this.subSubCategoryRepo = subSubCategoryRepo;
        this.sizeRepo = sizeRepo;
        this.wishRepo = wishRepo;
        this.cartRepo = cartRepo;
        this.buyingHistoryRepo = buyingHistoryRepo;
        this.deliveryStatusRepo = deliveryStatusRepo;
        this.paymentMethodRepo = paymentMethodRepo;
        this.colorSizeRepo = colorSizeRepo;
    }
    async addBanner(myDto) {
        return this.bannerRepo.save(myDto);
    }
    async createUser(myDto) {
        const salt = await bcrypt.genSalt();
        const hashedPass = await bcrypt.hash(myDto.password, salt);
        myDto.password = hashedPass;
        return this.adminRepo.save(myDto);
    }
    async sendEmail(mydto) {
        return await this.mailerService.sendMail({
            to: mydto.email,
            subject: mydto.subject,
            text: mydto.text,
        });
    }
    async signIn(myDto) {
        const myData = await this.adminRepo.findOneBy({ email: myDto.email });
        if (!myData) {
            return 0;
        }
        if (myDto.password == myData.password) {
            return true;
        }
        return false;
    }
    async updateAdmin(myDto, email) {
        try {
            const result = await this.adminRepo.update({ email: email }, myDto);
            if (result.affected === 0) {
                return 'Admin not found';
            }
            else {
                return 'Admin updated';
            }
        }
        catch (err) {
            console.error(err);
            return 'Update failed';
        }
    }
    async deleteBanner(id) {
        const myData = await this.bannerRepo.findOneBy({ id });
        if (myData)
            return this.bannerRepo.delete(myData);
        throw new common_1.NotFoundException(`Banner with ID ${id} not found.`);
        ;
    }
    async deleteCartItem(id) {
        const myData = await this.cartRepo.findOneBy({ uniqueId: id });
        if (myData) {
            return this.cartRepo.delete(myData);
        }
        throw new common_1.NotFoundException(`Banner with ID ${id} not found.`);
        ;
    }
    async deleteCarts(cartArray, email) {
        try {
            const cartsToDelete = await this.cartRepo.find({ where: { uniqueId: (0, typeorm_2.In)(cartArray), customer: { email: email } } });
            if (cartsToDelete.length > 0) {
                const deletionResult = await this.cartRepo.remove(cartsToDelete);
                return deletionResult;
            }
            throw new common_1.NotFoundException(`No carts found with the provided unique IDs.`);
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error deleting carts: ${error.message}`);
        }
    }
    async addNewProduct(myDto) {
        const newCategory = await this.getCategoryById(myDto.categoryId);
        const newProduct = this.productRepo.create({
            ...myDto,
            category: newCategory
        });
        return this.productRepo.save(newProduct);
    }
    async viewAllProduct() {
        const options = {};
        const products = await this.productRepo.find(options);
        return products;
    }
    async getAllBuyingHistories(email) {
        if (email) {
            const cartsWithHistory = await this.cartRepo.find({
                where: {
                    customer: { email: email },
                    history: { PaymentDone: true || false }
                },
                relations: ['history'],
            });
            const uniqueHistories = new Set();
            cartsWithHistory.forEach((cart) => {
                if (cart.history) {
                    uniqueHistories.add(cart.history);
                }
            });
            const buyingHistoriesArray = Array.from(uniqueHistories);
            return buyingHistoriesArray;
        }
        throw new common_1.HttpException('Forbidden', common_1.HttpStatus.FORBIDDEN);
    }
    async getAllCoupons() {
        const coupons = await this.couponRepo.find();
        return coupons;
    }
    async getAllDeliveryStatus() {
        const statuses = await this.deliveryStatusRepo.find();
        return statuses;
    }
    async getAllPaymentMethod() {
        const methods = await this.paymentMethodRepo.find();
        return methods;
    }
    async getParticularCoupon(id) {
        const coupon = await this.couponRepo.findOne(id);
        return coupon;
    }
    async disableCoupon(id) {
        const coupon = await this.getParticularCoupon(id);
        coupon.isEnable = false;
        await this.couponRepo.save(coupon);
    }
    async getAllCarts(email) {
        if (email) {
            const cartsWithHistory = await this.cartRepo.find({
                where: {
                    customer: { email: email },
                },
            });
            return cartsWithHistory;
        }
        throw new common_1.HttpException('Forbidden', common_1.HttpStatus.FORBIDDEN);
    }
    async viewAllBanners() {
        const options = {};
        const banners = await this.bannerRepo.find(options);
        return banners;
    }
    async viewColors() {
        const options = {};
        const colors = await this.colorRepo.find(options);
        return colors;
    }
    async viewProductCategories() {
        const options = {};
        const categories = await this.categoryRepo.find(options);
        return categories;
    }
    async viewAllProductSubSubCategories() {
        const subCategories = await this.subSubCategoryRepo.find({
            relations: ['category', 'category.category'],
        });
        return subCategories;
    }
    async viewAllProductSubCategories() {
        const options = {};
        const subCategories = await this.subCategoryRepo.find(options);
        return subCategories;
    }
    async viewProductSubCategories(id) {
        const subCats = await this.subCategoryRepo.find({ where: { category: { id: id } } });
        return subCats;
    }
    async viewProductSubSubCategories(id) {
        const subCats = await this.subSubCategoryRepo.find({ where: { category: { id: id } } });
        return subCats;
    }
    async viewProductSizes() {
        const options = {};
        const sizes = await this.sizeRepo.find(options);
        return sizes;
    }
    async getCategoryById(id) {
        return await this.categoryRepo.findOneBy({ id });
    }
    async getSubSubCategoryById(id) {
        return await this.subSubCategoryRepo.findOneBy({ id });
    }
    async getProductFtImage(productId) {
        const result = await this.productPicRepo.findOne({
            where: {
                isThumbnail: true,
                product: {
                    id: productId,
                },
            },
        });
        return result;
    }
    async getBannerById(id) {
        return await this.bannerRepo.findOneBy({ id });
    }
    async getSizeById(id) {
        return await this.sizeRepo.findOneBy({ id });
    }
    async getCartById(id) {
        return await this.cartRepo.findOneBy({ id });
    }
    async getProductById(id) {
        return await this.productRepo.findOneBy({ id });
    }
    async getPaymentMethodById(id) {
        return await this.paymentMethodRepo.findOneBy({ id });
    }
    async getColorById(id) {
        return await this.colorRepo.findOneBy({ id });
    }
    async getCustomerById(id) {
        return await this.customerRepo.findOneBy({ id });
    }
    async getCustomerByEmail(email) {
        return await this.customerRepo.findOneBy({ email: email });
    }
    async getColorByName(name) {
        return await this.colorRepo.findOneBy({ name: name });
    }
    async getDeliveryStatusById(id) {
        return await this.deliveryStatusRepo.findOneBy({ id });
    }
    async getCouponById(id) {
        return await this.couponRepo.findOneBy({ id });
    }
    async getBuyingHistoryById(token) {
        return await this.buyingHistoryRepo.findOneBy({ trackingToken: token });
    }
    async getProductByCatId(id) {
        return await this.buyingHistoryRepo.findOneBy({ id });
    }
    async getProductBySubSubCatId(subCategoryId) {
        try {
            const products = await this.productRepo
                .createQueryBuilder('product')
                .leftJoinAndSelect('product.subCategories', 'subCategory')
                .leftJoinAndSelect('product.color', 'color')
                .where('subCategory.id = :subCategoryId', { subCategoryId })
                .getMany();
            return products;
        }
        catch (error) {
            console.error('Error finding products:', error);
            throw error;
        }
    }
    async updateCategory(id, category) {
        const user = await this.categoryRepo.findOneBy({ id });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found.`);
        }
        await this.categoryRepo.update(id, { ...category });
    }
    async updateBanner(id, bannerDto) {
        const banner = await this.bannerRepo.findOneBy({ id });
        if (!banner) {
            throw new common_1.NotFoundException(`Banner with ID ${id} not found.`);
        }
        await this.bannerRepo.update(id, { ...bannerDto });
    }
    async updateBuyingHistory(token, details, email) {
        const history = await this.buyingHistoryRepo.findOneBy({ trackingToken: token });
        if (!history) {
            throw new common_1.NotFoundException(`Not found.`);
        }
        history.PaymentDetails = details;
        const result = await this.buyingHistoryRepo.save(history);
        return result;
    }
    async deleteProductById(id) {
        try {
            const product = await this.productRepo.findOneBy({ id });
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID ${id} not found.`);
            }
            const deleted = this.productRepo.delete(product);
            return deleted;
        }
        catch (error) {
            console.error('Error deleting product:', error);
        }
    }
    async deleteSizeById(id) {
        try {
            const size = await this.sizeRepo.findOneBy({ id });
            if (!size) {
                throw new common_1.NotFoundException(`Size with ID ${id} not found.`);
            }
            const deleted = this.sizeRepo.delete(size);
            return deleted;
        }
        catch (error) {
            console.error('Error deleting size:', error);
        }
    }
    async createNewCategory(myDto) {
        const newCategory = this.categoryRepo.create({
            ...myDto
        });
        return this.categoryRepo.save(newCategory);
    }
    async createNewCoupon(myDto) {
        const newCoupon = this.couponRepo.create({
            ...myDto
        });
        return this.couponRepo.save(newCoupon);
    }
    async createNewSubCategory(myDto) {
        const category = await this.getCategoryById(myDto.categoryId);
        myDto.category = category;
        const newCategory = this.subCategoryRepo.create({
            ...myDto
        });
        return this.subCategoryRepo.save(newCategory);
    }
    async createNewSize(myDto) {
        const newSize = this.sizeRepo.create({
            ...myDto
        });
        return this.sizeRepo.save(newSize);
    }
    async createNewBuy(myDto) {
        myDto.deliveryStatus = await this.getDeliveryStatusById(myDto?.deliveryStatusId || 1);
        myDto.paymentMethod = await this.getPaymentMethodById(myDto?.paymentMethodId || 1);
        myDto.trackingToken = (0, uuid_1.v4)();
        const newProduct = this.buyingHistoryRepo.create({
            ...myDto
        });
        const savedProduct = await this.buyingHistoryRepo.save(newProduct);
        this.createNewCartObject(savedProduct, myDto.carts);
        return savedProduct;
    }
    async createNewCart(myDto) {
        const selectedProduct = await this.getProductById(myDto.productId);
        myDto.product = selectedProduct;
        myDto.uniqueId = (0, uuid_1.v4)();
        myDto.customer = await this.getCustomerById(myDto.customerId);
        myDto.coupon = await this.getCouponById(myDto.couponId);
        const selectedColor = await this.getColorById(myDto.colorId);
        myDto.ProductName = selectedColor.name + " " + selectedProduct.name;
        const newCart = this.cartRepo.create({
            ...myDto
        });
        const savedProduct = await this.cartRepo.save(newCart);
        return savedProduct;
    }
    async createNewCartObject(product, cartsData) {
        for (const cartDataId of cartsData) {
            const cart = await this.getCartById(cartDataId);
            if (cart) {
                cart.history = product;
                await this.cartRepo.save(cart);
            }
        }
        return true;
    }
    async createNewWish(myDto) {
        myDto.product = await this.getProductById(myDto.productId);
        myDto.customer = await this.getCustomerById(myDto.customerId);
        const newWish = this.wishRepo.create({
            ...myDto
        });
        const savedProduct = await this.wishRepo.save(newWish);
        return savedProduct;
    }
    async createNewProduct(myDto) {
        console.log(myDto.subCategories, "588");
        const subCategoriesArray = typeof myDto.subCategories === 'string' ? myDto.subCategories.split(',').map(Number) : myDto.subCategories;
        console.log(subCategoriesArray, "594");
        const subs = await this.viewAllProductSubSubCategories();
        const categories = subs.filter(cat => subCategoriesArray.includes(cat.id));
        console.log(categories, "594");
        myDto.subCategories = [...categories];
        const selectedColor = await this.getColorByName(myDto.color);
        console.log(selectedColor);
        myDto.color = selectedColor;
        const newProduct = this.productRepo.create({
            ...myDto
        });
        const savedProduct = await this.productRepo.save(newProduct);
        return savedProduct;
    }
    async createNewFileObject(product, filesData) {
        for (const fileData of filesData) {
            const file = this.productPicRepo.create({
                filename: fileData,
                isThumbnail: fileData?.isThumbnail || false,
                isFeatured: fileData?.isFeatured || false,
                product: product,
            });
            await this.productPicRepo.save(file);
        }
        return true;
    }
    async changeCategoryImage(id, myFile) {
        const user = await this.categoryRepo.findOneBy({ id });
        if (user) {
            user.filename = myFile;
            return await this.categoryRepo.save(user);
        }
        return null;
    }
    async changeBannerImage(id, myFile) {
        const banner = await this.bannerRepo.findOneBy({ id });
        if (banner) {
            banner.filename = myFile;
            return await this.bannerRepo.save(banner);
        }
        return null;
    }
};
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admin_entity_1.AdminEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_entity_1.CustomerEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(product_pictures_entity_1.ProductPictureEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(banner_entity_1.BannerEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(category_entity_1.CategoryEntity)),
    __param(7, (0, typeorm_1.InjectRepository)(coupon_entity_1.CouponEntity)),
    __param(8, (0, typeorm_1.InjectRepository)(colors_entity_1.ColorEntity)),
    __param(9, (0, typeorm_1.InjectRepository)(subCategory_entity_1.SubCategoryEntity)),
    __param(10, (0, typeorm_1.InjectRepository)(subSubCategory_entity_1.SubSubCategoryEntity)),
    __param(11, (0, typeorm_1.InjectRepository)(size_entity_1.SizeEntity)),
    __param(12, (0, typeorm_1.InjectRepository)(wish_entity_1.WishEntity)),
    __param(13, (0, typeorm_1.InjectRepository)(cart_entity_1.CartsEntity)),
    __param(14, (0, typeorm_1.InjectRepository)(buyingHistory_entity_1.BuyingHistoryEntity)),
    __param(15, (0, typeorm_1.InjectRepository)(deliveryStatus_entity_1.DeliveryStatusEntity)),
    __param(16, (0, typeorm_1.InjectRepository)(paymentMethod_entity_1.PaymentMethodEntity)),
    __param(17, (0, typeorm_1.InjectRepository)(color_size_combined_entity_1.ColorSizeEntity)),
    __metadata("design:paramtypes", [typeorm_3.Repository,
        dist_1.MailerService,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map