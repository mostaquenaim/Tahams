/// <reference types="multer" />
import { HttpStatus } from '@nestjs/common';
import { AdminService } from '../Services/admin.service';
import { AdminForm } from '../DTOs/adminform.dto';
import CouponForm from 'src/Global/DTOs/couponform.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    signIn(myDto: any): Promise<{
        status: HttpStatus;
        message: string;
        error?: undefined;
        data?: undefined;
    } | {
        status: HttpStatus;
        error: {
            message: string;
        };
        message?: undefined;
        data?: undefined;
    } | {
        status: HttpStatus;
        message: string;
        data: import("../../Global/Entities/user.entity").UserEntity;
        error?: undefined;
    } | {
        status: HttpStatus;
        message: string;
        error: any;
        data?: undefined;
    }>;
    checkEmail(email: string): Promise<{
        status: HttpStatus;
        message: string;
    }>;
    customerLogin(myDto: any): Promise<any>;
    sendEmail(mydata: any): Promise<void>;
    sendOtp(sendOtpDto: any): Promise<{
        success: boolean;
        message: string;
    } | {
        status: HttpStatus;
        message: string;
        data: any;
    }>;
    verifyOtp(verifyOtpDto: any): Promise<{
        success: boolean;
        message: string;
    }>;
    addBanner(myDto: any, file: Express.Multer.File): Promise<any>;
    viewAllBanners(): Promise<import("../../Global/Entities/banner.entity").BannerEntity[]>;
    viewBannerById(id: number): Promise<import("../../Global/Entities/banner.entity").BannerEntity>;
    deleteBanner(id: number): Promise<import("typeorm").DeleteResult>;
    updateBanner(id: number, myDto: any): Promise<void>;
    publishProduct(id: number, publishable: boolean): Promise<void>;
    changeBannerImage(id: any, file: Express.Multer.File): object;
    createNewBuy(myDto: any): Promise<import("../../Global/Entities/buyingHistory.entity").BuyingHistoryEntity[]>;
    updateBuyingHistory(tt: string, email: string, updates: {
        [key: string]: any;
    }): Promise<import("../../Global/Entities/buyingHistory.entity").BuyingHistoryEntity>;
    getBuyingHistoryByToken(token: any, email: string): Promise<import("../../Global/Entities/cart.entity").CartsEntity[]>;
    addPaymentInfo(PaymentDetails: any, file: Express.Multer.File): Promise<void>;
    getAllBuyingHistories(email: string): Promise<import("../../Global/Entities/cart.entity").CartsEntity[]>;
    createNewCart(myDto: any): Promise<import("../../Global/Entities/cart.entity").CartsEntity[]>;
    deleteCartItem(id: any, email: any): Promise<import("typeorm").DeleteResult>;
    deleteCarts(myDto: any): Promise<import("typeorm").DeleteResult>;
    getAllCarts(email: string): Promise<import("../../Global/Entities/cart.entity").CartsEntity[]>;
    viewProductCategories(): Promise<import("../../Global/Entities/category.entity").CategoryEntity[]>;
    viewAllProductSubSubCategories(): Promise<import("../../Global/Entities/subSubCategory.entity").SubSubCategoryEntity[]>;
    viewColors(): Promise<import("../../Global/Entities/colors.entity").ColorEntity[]>;
    viewFabrics(): Promise<import("../../Global/Entities/fabrics.entity").FabricEntity[]>;
    viewAllProductSubCategories(): Promise<import("../../Global/Entities/subCategory.entity").SubCategoryEntity[]>;
    viewProductSubCategories(id: number): Promise<import("../../Global/Entities/subCategory.entity").SubCategoryEntity[]>;
    viewProductSubSubCategories(catId: number): Promise<import("../../Global/Entities/subSubCategory.entity").SubSubCategoryEntity[]>;
    checkIfWished(customerId: number, productId: number): Promise<{
        wished: boolean;
    }>;
    getSubCatById(id: number): Promise<import("../../Global/Entities/subSubCategory.entity").SubSubCategoryEntity>;
    getProductFtImage(id: number): Promise<import("../../Global/Entities/product-pictures.entity").ProductPictureEntity>;
    getCategoryById(id: any): Promise<import("../../Global/Entities/category.entity").CategoryEntity>;
    getProductByCat(name: any): Promise<import("../../Global/Entities/product.entity").ProductEntity[]>;
    getProductBySubSubCatId(id: any): Promise<import("../../Global/Entities/product.entity").ProductEntity[]>;
    getUserByEmail(email: any): Promise<import("../../Global/Entities/user.entity").UserEntity>;
    updateCategory(id: number, myDto: any): Promise<void>;
    updateUserAddress(id: number, updateAddressDto: any): Promise<import("../../Global/Entities/user.entity").UserEntity>;
    createNewCategory(myDto: any): Promise<import("../../Global/Entities/category.entity").CategoryEntity[]>;
    createPaymentMethod(myDto: any): Promise<import("../../Global/Entities/paymentMethod.entity").PaymentMethodEntity[]>;
    increaseProductView(id: number, email: string): Promise<import("../../Global/Entities/viewProduct.entity").ViewProductEntity>;
    createNewSubCategory(myDto: any): Promise<import("../../Global/Entities/subCategory.entity").SubCategoryEntity[]>;
    createNewSubSubCategory(myDto: any): Promise<import("../../Global/Entities/subSubCategory.entity").SubSubCategoryEntity[]>;
    changeCategoryImage(id: any, file: Express.Multer.File): object;
    createNewCoupon(myDto: CouponForm): Promise<import("../../Global/Entities/coupon.entity").CouponEntity[]>;
    createNewColor(myDto: any): Promise<import("../../Global/Entities/colors.entity").ColorEntity[]>;
    getAllCoupons(): Promise<import("../../Global/Entities/coupon.entity").CouponEntity[]>;
    getParticularCoupon(id: number): Promise<import("../../Global/Entities/coupon.entity").CouponEntity>;
    disableCoupon(id: number): Promise<void>;
    getAllDeliveryStatus(): Promise<import("../../Global/Entities/deliveryStatus.entity").DeliveryStatusEntity[]>;
    getAllPaymentMethod(): Promise<import("../../Global/Entities/paymentMethod.entity").PaymentMethodEntity[]>;
    logout(session: any): {
        message: string;
    };
    createUser(myDto: any): Promise<{
        status: HttpStatus;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        status: HttpStatus;
        message: string;
        data: any;
        error?: undefined;
    } | {
        status: HttpStatus;
        message: string;
        error: any;
        data?: undefined;
    }>;
    viewAllProducts(query: any): Promise<import("../../Global/Entities/product.entity").ProductEntity[]>;
    viewProductSizes(): Promise<import("../../Global/Entities/size.entity").SizeEntity[]>;
    getProductById(id: any): Promise<import("../../Global/Entities/product.entity").ProductEntity>;
    deleteProductById(id: number, email: string): Promise<import("typeorm").DeleteResult>;
    deleteSizeById(id: number): Promise<import("typeorm").DeleteResult>;
    createNewSize(myDto: any): Promise<import("../../Global/Entities/size.entity").SizeEntity[]>;
    createNewFabric(myDto: any): Promise<import("../../Global/Entities/fabrics.entity").FabricEntity[]>;
    addProductFunc(mydata: any, imageobj: Express.Multer.File): Promise<any>;
    addProductPictures(files: any, mydata: any): Promise<boolean>;
    updateAdmin(myDto: AdminForm, file: Express.Multer.File): Promise<"Admin not found" | "Admin updated" | "Update failed">;
    createNewWish(myDto: any): Promise<import("../../Global/Entities/wish.entity").WishEntity>;
    removeWish(productId: number, email: string): Promise<import("typeorm").DeleteResult>;
    getWishByUser(email: string): Promise<import("../../Global/Entities/wish.entity").WishEntity[]>;
    getImages(name: any, res: any): void;
}
