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
const user_entity_1 = require("../../Global/Entities/user.entity");
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
const paymentInfo_entity_1 = require("../../Global/Entities/paymentInfo.entity");
const typeorm_4 = require("typeorm");
const fabrics_entity_1 = require("../../Global/Entities/fabrics.entity");
const productSizeCategory_entity_1 = require("../../Global/Entities/productSizeCategory.entity");
const otp_entity_1 = require("../../Global/Entities/otp.entity");
const viewProduct_entity_1 = require("../../Global/Entities/viewProduct.entity");
let AdminService = exports.AdminService = class AdminService {
    constructor(adminRepo, mailerService, userRepo, productRepo, productSizeCategoryRepo, productPicRepo, bannerRepo, paymentInfoRepo, categoryRepo, couponRepo, colorRepo, otpRepository, subCategoryRepo, subSubCategoryRepo, sizeRepo, viewRepo, wishRepo, cartRepo, buyingHistoryRepo, deliveryStatusRepo, paymentMethodRepo, fabricRepo, colorSizeRepo) {
        this.adminRepo = adminRepo;
        this.mailerService = mailerService;
        this.userRepo = userRepo;
        this.productRepo = productRepo;
        this.productSizeCategoryRepo = productSizeCategoryRepo;
        this.productPicRepo = productPicRepo;
        this.bannerRepo = bannerRepo;
        this.paymentInfoRepo = paymentInfoRepo;
        this.categoryRepo = categoryRepo;
        this.couponRepo = couponRepo;
        this.colorRepo = colorRepo;
        this.otpRepository = otpRepository;
        this.subCategoryRepo = subCategoryRepo;
        this.subSubCategoryRepo = subSubCategoryRepo;
        this.sizeRepo = sizeRepo;
        this.viewRepo = viewRepo;
        this.wishRepo = wishRepo;
        this.cartRepo = cartRepo;
        this.buyingHistoryRepo = buyingHistoryRepo;
        this.deliveryStatusRepo = deliveryStatusRepo;
        this.paymentMethodRepo = paymentMethodRepo;
        this.fabricRepo = fabricRepo;
        this.colorSizeRepo = colorSizeRepo;
    }
    async addBanner(myDto) {
        return this.bannerRepo.save(myDto);
    }
    async addPaymentInfo(myDto) {
        const cart = await this.getBuyingHistoryByToken(myDto.history, myDto.customer);
        const history = cart.history;
        const paymentMethod = await this.getPaymentMethodById(myDto.paymentMethod);
        history.paymentMethod = paymentMethod;
        if (myDto.paymentMethod == '1' || myDto.paymentMethod == '8') {
            history.PaymentDetails = paymentMethod.name;
        }
        else {
            history.PaymentDone = true;
            history.screenshot = myDto.screenshot;
            history.PaymentDetails =
                `
      Payment by: ${paymentMethod.name} \n
      Account number: ${myDto.accountNumber}
      `;
        }
        await this.buyingHistoryRepo.save(history);
    }
    async createUser(myDto) {
        try {
            const existingUser = await this.userRepo.findOne({ where: { email: myDto.email } });
            if (existingUser) {
                return {
                    status: common_1.HttpStatus.CONFLICT,
                    message: 'Email is already in use',
                };
            }
            const salt = await bcrypt.genSalt();
            const hashedPass = await bcrypt.hash(myDto.password, salt);
            myDto.password = hashedPass;
            const savedUser = await this.userRepo.save(myDto);
            return {
                status: common_1.HttpStatus.CREATED,
                message: 'User created successfully',
                data: savedUser,
            };
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'An error occurred while creating the user',
                error: error.message,
            };
        }
    }
    async createCustomer(myDto) {
        const salt = await bcrypt.genSalt();
        const hashedPass = await bcrypt.hash(myDto.password, salt);
        myDto.password = hashedPass;
        return this.userRepo.save(myDto);
    }
    async sendEmail(myDto) {
        try {
            await this.mailerService.sendMail({
                to: myDto.email,
                subject: myDto.subject,
                text: myDto.text,
            });
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to send email');
        }
    }
    async checkEmailAndSendOTP(email) {
        const user = await this.getUserByEmail(email);
        if (!user) {
            const result = await this.sendOtp(email);
            return result;
        }
        else {
            return { status: common_1.HttpStatus.BAD_REQUEST, message: 'Email already exists', data: null };
        }
    }
    async sendOtp(email) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        const otpEntity = this.otpRepository.create({ email, otp });
        await this.otpRepository.save(otpEntity);
        await this.sendEmail({
            email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
        });
        return { success: true, message: 'OTP sent' };
    }
    async verifyOtp(email, otp) {
        const otpData = await this.otpRepository.findOne({ where: { email, otp } });
        if (!otpData) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        const currentTime = new Date();
        const otpCreationTime = new Date(otpData.createdAt);
        const timeDifference = (currentTime.getTime() - otpCreationTime.getTime()) / (1000 * 60);
        if (otpData.otp !== otp || timeDifference > 10) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        await this.otpRepository.delete({ email });
        return { success: true, message: 'OTP verified successfully' };
    }
    async signIn(myDto) {
        try {
            const myData = await this.userRepo.findOne({ where: { email: myDto.email } });
            if (!myData) {
                return { status: common_1.HttpStatus.NOT_FOUND, message: 'User not found' };
            }
            const isPasswordValid = await bcrypt.compare(myDto.password, myData.password);
            if (isPasswordValid) {
                if (myData.loggedInWith === 'Google') {
                    return {
                        status: common_1.HttpStatus.UNAUTHORIZED,
                        error: {
                            message: 'You must log in with Google to access this resource.',
                        },
                    };
                }
                return { status: common_1.HttpStatus.OK, message: 'Login successful', data: myData };
            }
            if (myData.loggedInWith === 'Google' || myDto.password === process.env.GOOGLE_PASS) {
                return { status: common_1.HttpStatus.OK, message: 'Login with google successful', data: myData };
            }
            return { status: common_1.HttpStatus.UNAUTHORIZED, message: 'Invalid password' };
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'An error occurred during login',
                error: error.message,
            };
        }
    }
    async checkEmail(email) {
        const existingUser = await this.userRepo.findOne({ where: { email } });
        if (!existingUser) {
            return { status: common_1.HttpStatus.NOT_FOUND, message: 'User not found' };
        }
        if (existingUser.loggedInWith === 'Google') {
            return { status: common_1.HttpStatus.OK, message: 'Email is already in use' };
        }
        await this.userRepo.update(existingUser.id, { loggedInWith: 'Google' });
        return { status: common_1.HttpStatus.OK, message: 'Email updated successfully' };
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
    async publishProduct(id, publishable) {
        const product = await this.productRepo.findOneBy({ id });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found.`);
        }
        product.publishable = publishable;
        await this.productRepo.save(product);
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
            return this.cartRepo.delete(myData.id);
        }
        throw new common_1.NotFoundException(`Banner with ID ${id} not found.`);
        ;
    }
    async deleteCarts(cartArray) {
        try {
            const deletionResult = await this.cartRepo.delete({ id: (0, typeorm_2.In)(cartArray) });
            return deletionResult;
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error deleting carts: ${error.message}`);
        }
    }
    async viewAllProducts(filters) {
        try {
            const products = await this.productRepo
                .createQueryBuilder('product')
                .leftJoinAndSelect('product.color', 'color')
                .leftJoinAndSelect('product.fabric', 'fabric')
                .leftJoinAndSelect('product.productPictures', 'productPicture')
                .leftJoinAndSelect('product.pscs', 'psc')
                .leftJoinAndSelect('psc.category', 'subSubCategory')
                .leftJoinAndSelect('psc.size', 'size')
                .andWhere(filters)
                .getMany();
            return products;
        }
        catch (error) {
            console.error('Error finding products:', error);
            throw error;
        }
    }
    async getAllBuyingHistories(email) {
        if (email) {
            const user = await this.getUserByEmail(email);
            const cartsWithHistory = await this.cartRepo.find({
                where: {
                    ...(user.role !== 'admin' && { customer: { email: email } }),
                    isBought: true
                },
                relations: [
                    'history',
                    'history.deliveryStatus',
                    'history.paymentMethod',
                    'customer',
                    'product'
                ],
            });
            return cartsWithHistory;
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
                relations: ['product', 'coupon', 'category', 'category.category', 'category.category.category']
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
    async viewFabrics() {
        const options = {};
        const fabrics = await this.fabricRepo.find(options);
        return fabrics;
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
        const subCategories = await this.subCategoryRepo.find({
            relations: ['category'],
        });
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
    async getCategoryByName(name) {
        return await this.categoryRepo.findOneBy({ name: name });
    }
    async getSubCategoryById(id) {
        return await this.subCategoryRepo.findOneBy({ id: id });
    }
    async getSubSubCategoryById(id) {
        return await this.subSubCategoryRepo.findOneBy({ id });
    }
    async checkIfWished(productId, customerId) {
        const wished = await this.wishRepo.findOne({
            where: {
                product: { id: productId },
                customer: { id: customerId },
            },
        });
        return { wished: !!wished };
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
    async getSizeByName(name) {
        return await this.sizeRepo.findOneBy({ name });
    }
    async getCartById(id) {
        return await this.cartRepo.findOneBy({ id });
    }
    async getPaymentMethodById(id) {
        return await this.paymentMethodRepo.findOneBy({ id });
    }
    async getColorById(id) {
        return await this.colorRepo.findOneBy({ id });
    }
    async getCustomerById(id) {
        return await this.userRepo.findOneBy({ uniqueId: id });
    }
    async getUserByEmail(email) {
        return await this.userRepo.findOneBy({ email: email });
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
    async getBuyingHistoryByToken(token, email) {
        if (email) {
            const cartWithHistory = await this.cartRepo.findOne({
                where: {
                    customer: { email: email },
                    history: { trackingToken: token },
                },
                relations: [
                    'history',
                    'history.deliveryStatus',
                    'history.paymentMethod',
                    'customer',
                    'product'
                ],
            });
            return cartWithHistory;
        }
        throw new common_1.HttpException('Forbidden', common_1.HttpStatus.FORBIDDEN);
    }
    async getProductByCat(name) {
        const products = await this.productRepo.find({
            where: {
                pscs: {
                    category: { category: { category: { name } } }
                },
                publishable: true
            },
            relations: ['color', 'fabric', 'productPictures', 'pscs', 'pscs.category', 'pscs.category.category.category', 'pscs.size']
        });
        return products;
    }
    async getPublishableProductsBySubSubCatId(subCategoryId) {
        try {
            const products = await this.getProductBySubSubCatId(subCategoryId);
            const publishableProducts = products.filter(product => product.publishable);
            return publishableProducts;
        }
        catch (error) {
            console.error('Error finding publishable products:', error);
            throw error;
        }
    }
    async getProductBySubSubCatId(subCategoryId) {
        try {
            const products = await this.productRepo
                .createQueryBuilder('product')
                .leftJoinAndSelect('product.color', 'color')
                .leftJoinAndSelect('product.fabric', 'fabric')
                .leftJoinAndSelect('product.productPictures', 'productPicture')
                .leftJoinAndSelect('product.pscs', 'psc')
                .leftJoinAndSelect('psc.category', 'subSubCategory')
                .leftJoinAndSelect('subSubCategory.category', 'subCategory')
                .leftJoinAndSelect('subCategory.category', 'category')
                .leftJoinAndSelect('psc.size', 'size')
                .where('subSubCategory.id = :subCategoryId', { subCategoryId })
                .getMany();
            return products;
        }
        catch (error) {
            console.error('Error finding products:', error);
            throw error;
        }
    }
    async getProductById(id) {
        return await this.productRepo.findOne({
            where: { id },
            relations: ['color', 'fabric', 'productPictures', 'pscs', 'pscs.category', 'pscs.category.category.category', 'pscs.size']
        });
    }
    async updateCategory(id, category) {
        const user = await this.categoryRepo.findOneBy({ id });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found.`);
        }
        await this.categoryRepo.update(id, { ...category });
    }
    async updateUserAddress(userId, updateAddressDto) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found.`);
        }
        user.name = updateAddressDto?.name || user.name;
        user.city = updateAddressDto?.city || user.city;
        user.region = updateAddressDto?.region || user.region;
        user.address = updateAddressDto?.address || user.address;
        user.mbl_no = updateAddressDto?.mbl_no || user.mbl_no;
        return await this.userRepo.save(user);
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
            await this.productPicRepo.delete({ product: { id } });
            await this.productSizeCategoryRepo.delete({ product: { id } });
            const deleted = await this.productRepo.delete(id);
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
    async removeWish(myData) {
        try {
            const wish = await this.wishRepo.findOne({
                where: {
                    product: { id: myData.productId },
                    customer: { id: myData.customerId }
                }
            });
            if (!wish) {
                throw new common_1.NotFoundException(`Wish not found.`);
            }
            const deleted = this.wishRepo.delete(wish);
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
    async createPaymentMethod(myDto) {
        const newPaymentMethod = this.paymentMethodRepo.create({
            ...myDto
        });
        return this.paymentMethodRepo.save(newPaymentMethod);
    }
    async increaseProductView(productId, email) {
        const existingView = await this.viewRepo.findOne({
            where: {
                product: { id: productId },
                user: { email },
            },
        });
        if (existingView) {
            existingView.count += 1;
            await this.viewRepo.save(existingView);
        }
        else {
            const newView = this.viewRepo.create({
                product: { id: productId },
                user: { email },
                count: 1,
            });
            await this.viewRepo.save(newView);
        }
    }
    async createNewCoupon(myDto) {
        const newCoupon = this.couponRepo.create({
            ...myDto
        });
        return this.couponRepo.save(newCoupon);
    }
    async createNewColor(myDto) {
        const newColor = this.colorRepo.create({
            ...myDto
        });
        return this.colorRepo.save(newColor);
    }
    async createNewSubCategory(myDto) {
        const category = await this.getCategoryByName(myDto.categoryName);
        myDto.category = category;
        const newCategory = this.subCategoryRepo.create({
            ...myDto
        });
        return this.subCategoryRepo.save(newCategory);
    }
    async createNewSubSubCategory(myDto) {
        const category = await this.getSubCategoryById(myDto.categoryId);
        myDto.category = category;
        const newCategory = this.subSubCategoryRepo.create({
            ...myDto
        });
        return this.subSubCategoryRepo.save(newCategory);
    }
    async createNewSize(myDto) {
        const newSize = this.sizeRepo.create({
            ...myDto
        });
        return this.sizeRepo.save(newSize);
    }
    async createNewFabric(myDto) {
        const newFabric = this.fabricRepo.create({
            ...myDto
        });
        return this.fabricRepo.save(newFabric);
    }
    async customerLogin(myDto) {
        try {
            const existingCustomer = await this.userRepo.findOne({
                where: { email: myDto.email },
            });
            if (!existingCustomer) {
                const newCustomer = this.createCustomer(myDto);
                return newCustomer;
            }
            return true;
        }
        catch (error) {
            throw new Error('Authentication failed');
        }
    }
    async createNewBuy(myDto) {
        myDto.deliveryStatus = await this.getDeliveryStatusById(myDto?.deliveryStatusId || 1);
        myDto.paymentMethod = await this.getPaymentMethodById(myDto?.paymentMethodId || 1);
        myDto.trackingToken = (0, uuid_1.v4)();
        const newBuy = this.buyingHistoryRepo.create({
            ...myDto
        });
        const savedBuy = await this.buyingHistoryRepo.save(newBuy);
        this.createNewCartObject(savedBuy, myDto.carts);
        return savedBuy;
    }
    async createNewCartObject(buy, cartsData) {
        for (const cartDataId of cartsData) {
            const cart = await this.cartRepo.findOne({
                where: { id: cartDataId },
                relations: ['product', 'category'],
            });
            const size = await this.getSizeByName(cart.size);
            const pscObj = await this.productSizeCategoryRepo.findOne({
                where: {
                    category: cart.category,
                    size: size,
                    product: { id: cart.product.id },
                },
                relations: ['product']
            });
            pscObj.quantity -= cart.Quantity;
            await this.productSizeCategoryRepo.save(pscObj);
            if (cart) {
                cart.isBought = true;
                cart.totalPrice = Math.ceil((cart.product.sellingPrice - (cart.product.sellingPrice * cart.product.discountPercentage / 100) + (cart.product.sellingPrice * cart.product.vatPercentage / 100)) * cart.Quantity);
                cart.history = buy;
                await this.cartRepo.save(cart);
            }
        }
        return true;
    }
    async createNewCart(myDto) {
        const selectedProduct = await this.getProductById(myDto.productId);
        myDto.product = selectedProduct;
        myDto.uniqueId = (0, uuid_1.v4)();
        myDto.category = myDto?.category && await this.getSubSubCategoryById(myDto.category);
        myDto.customer = myDto?.customerEmail && await this.getUserByEmail(myDto?.customerEmail);
        myDto.coupon = myDto?.couponId && await this.getCouponById(myDto?.couponId);
        const selectedColor = await this.getColorById(myDto.colorId);
        myDto.ProductName = selectedColor.name + " " + selectedProduct.name;
        const newCart = this.cartRepo.create({
            ...myDto
        });
        const savedProduct = await this.cartRepo.save(newCart);
        return savedProduct;
    }
    async createNewWish(myDto) {
        myDto.product = await this.getProductById(myDto.productId);
        myDto.customer = await this.getUserByEmail(myDto.customerEmail);
        const newWish = this.wishRepo.create({
            ...myDto
        });
        const savedProduct = await this.wishRepo.save(newWish);
        return savedProduct;
    }
    getWishByUser(email) {
        return this.wishRepo.find({
            where: { customer: { email: email } },
            relations: ['product', 'customer'],
        });
    }
    async createNewProduct(myDto) {
        const selectedColor = await this.getColorByName(myDto.color);
        myDto.color = selectedColor;
        const newProduct = this.productRepo.create({
            ...myDto
        });
        const savedProduct = await this.productRepo.save(newProduct);
        return await this.createProductExtension(savedProduct, myDto.catsInfo);
    }
    async createProductExtension(product, catsInfo) {
        const catsInfoArray = JSON.parse(catsInfo);
        const processedCatsInfo = [];
        let previousCategory = null;
        catsInfoArray.forEach(item => {
            if (!Array.isArray(item)) {
                previousCategory = { categoryId: item, sizes: [] };
                processedCatsInfo.push(previousCategory);
            }
            else {
                const size = { sizeId: item[0], quantity: item[1] };
                previousCategory.sizes.push(size);
            }
        });
        for (const item of processedCatsInfo) {
            const catInfoItem = new productSizeCategory_entity_1.ProductSizeCategoryEntity();
            catInfoItem.product = product;
            catInfoItem.category = await this.subSubCategoryRepo.findOne({ where: { id: item.categoryId } });
            if (item.sizes.length <= 0) {
                await this.productSizeCategoryRepo.save(catInfoItem);
            }
            else {
                for (const sizeItem of item.sizes) {
                    const sizeObject = sizeItem.sizeId ? await this.getSizeById(sizeItem.sizeId) : null;
                    const newCatInfoItem = { ...catInfoItem };
                    newCatInfoItem.size = sizeObject;
                    newCatInfoItem.quantity = sizeItem.quantity;
                    await this.productSizeCategoryRepo.save(newCatInfoItem);
                }
            }
        }
        return product;
    }
    async addProductPictures(myDto) {
        const latestProduct = await this.productRepo.findOne({
            where: { id: (0, typeorm_4.MoreThan)(1) },
            order: { id: 'DESC' },
        });
        if (!latestProduct) {
            throw new Error('No product found');
        }
        const filenames = myDto.filenames;
        filenames.forEach(async (filename) => {
            const productPicture = new product_pictures_entity_1.ProductPictureEntity();
            productPicture.filename = filename;
            productPicture.product = latestProduct;
            await this.productPicRepo.save(productPicture);
        });
        return true;
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
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(productSizeCategory_entity_1.ProductSizeCategoryEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(product_pictures_entity_1.ProductPictureEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(banner_entity_1.BannerEntity)),
    __param(7, (0, typeorm_1.InjectRepository)(paymentInfo_entity_1.PaymentInfo)),
    __param(8, (0, typeorm_1.InjectRepository)(category_entity_1.CategoryEntity)),
    __param(9, (0, typeorm_1.InjectRepository)(coupon_entity_1.CouponEntity)),
    __param(10, (0, typeorm_1.InjectRepository)(colors_entity_1.ColorEntity)),
    __param(11, (0, typeorm_1.InjectRepository)(otp_entity_1.OtpEntity)),
    __param(12, (0, typeorm_1.InjectRepository)(subCategory_entity_1.SubCategoryEntity)),
    __param(13, (0, typeorm_1.InjectRepository)(subSubCategory_entity_1.SubSubCategoryEntity)),
    __param(14, (0, typeorm_1.InjectRepository)(size_entity_1.SizeEntity)),
    __param(15, (0, typeorm_1.InjectRepository)(viewProduct_entity_1.ViewProductEntity)),
    __param(16, (0, typeorm_1.InjectRepository)(wish_entity_1.WishEntity)),
    __param(17, (0, typeorm_1.InjectRepository)(cart_entity_1.CartsEntity)),
    __param(18, (0, typeorm_1.InjectRepository)(buyingHistory_entity_1.BuyingHistoryEntity)),
    __param(19, (0, typeorm_1.InjectRepository)(deliveryStatus_entity_1.DeliveryStatusEntity)),
    __param(20, (0, typeorm_1.InjectRepository)(paymentMethod_entity_1.PaymentMethodEntity)),
    __param(21, (0, typeorm_1.InjectRepository)(fabrics_entity_1.FabricEntity)),
    __param(22, (0, typeorm_1.InjectRepository)(color_size_combined_entity_1.ColorSizeEntity)),
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
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map