/// <reference types="multer" />
import { AdminService } from '../Services/admin.service';
import { AdminForm } from '../DTOs/adminform.dto';
import CouponForm from 'src/Global/DTOs/couponform.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    signIn(session: any, myDto: AdminForm): Promise<any>;
    addBanner(myDto: any, file: Express.Multer.File): Promise<any>;
    viewAllBanners(): Promise<import("../../Global/Entities/banner.entity").BannerEntity[]>;
    viewBannerById(id: number): Promise<import("../../Global/Entities/banner.entity").BannerEntity>;
    deleteBanner(id: number): Promise<import("typeorm").DeleteResult>;
    updateBanner(id: number, myDto: any): Promise<void>;
    changeBannerImage(id: any, file: Express.Multer.File): object;
    createNewBuy(myDto: any): Promise<import("../../Global/Entities/buyingHistory.entity").BuyingHistoryEntity[]>;
    updateBuyingHistory(id: any, email: string, details: any): Promise<import("../../Global/Entities/buyingHistory.entity").BuyingHistoryEntity>;
    getBuyingHistoryByToken(id: any): Promise<import("../../Global/Entities/buyingHistory.entity").BuyingHistoryEntity>;
    addPaymentInfo(PaymentDetails: any): Promise<any>;
    getAllBuyingHistories(email: string): Promise<unknown[]>;
    createNewCart(myDto: any): Promise<import("../../Global/Entities/cart.entity").CartsEntity[]>;
    customerLogin(myDto: any): Promise<any>;
    deleteCartItem(id: any, email: any): Promise<import("typeorm").DeleteResult>;
    deleteCarts(email: any, cartArray: any): Promise<import("../../Global/Entities/cart.entity").CartsEntity[]>;
    getAllCarts(email: string): Promise<import("../../Global/Entities/cart.entity").CartsEntity[]>;
    viewProductCategories(): Promise<import("../../Global/Entities/category.entity").CategoryEntity[]>;
    viewAllProductSubSubCategories(): Promise<import("../../Global/Entities/subSubCategory.entity").SubSubCategoryEntity[]>;
    viewColors(): Promise<import("../../Global/Entities/colors.entity").ColorEntity[]>;
    viewAllProductSubCategories(): Promise<import("../../Global/Entities/subCategory.entity").SubCategoryEntity[]>;
    viewProductSubCategories(id: number): Promise<import("../../Global/Entities/subCategory.entity").SubCategoryEntity[]>;
    viewProductSubSubCategories(catId: number): Promise<import("../../Global/Entities/subSubCategory.entity").SubSubCategoryEntity[]>;
    getSubCatById(id: number): Promise<import("../../Global/Entities/subSubCategory.entity").SubSubCategoryEntity>;
    getProductFtImage(id: number): Promise<import("../../Global/Entities/product-pictures.entity").ProductPictureEntity>;
    getCategoryById(id: any): Promise<import("../../Global/Entities/category.entity").CategoryEntity>;
    getProductByCat(name: any): Promise<void>;
    getProductBySubSubCatId(id: any): Promise<import("../../Global/Entities/product.entity").ProductEntity[]>;
    updateCategory(id: number, myDto: any): Promise<void>;
    createNewCategory(myDto: any): Promise<import("../../Global/Entities/category.entity").CategoryEntity[]>;
    createNewSubCategory(myDto: any): Promise<import("../../Global/Entities/subCategory.entity").SubCategoryEntity[]>;
    changeCategoryImage(id: any, file: Express.Multer.File): object;
    createNewCoupon(myDto: CouponForm): Promise<import("../../Global/Entities/coupon.entity").CouponEntity[]>;
    getAllCoupons(): Promise<import("../../Global/Entities/coupon.entity").CouponEntity[]>;
    getParticularCoupon(id: number): Promise<import("../../Global/Entities/coupon.entity").CouponEntity>;
    disableCoupon(id: number): Promise<void>;
    getAllDeliveryStatus(): Promise<import("../../Global/Entities/deliveryStatus.entity").DeliveryStatusEntity[]>;
    getAllPaymentMethod(): Promise<import("../../Global/Entities/paymentMethod.entity").PaymentMethodEntity[]>;
    sendEmail(mydata: any): Promise<SentMessageInfo>;
    logout(session: any): {
        message: string;
    };
    createUser(createUser: AdminForm): Promise<any>;
    viewAllProduct(): Promise<import("../../Global/Entities/product.entity").ProductEntity[]>;
    viewProductSizes(): Promise<import("../../Global/Entities/size.entity").SizeEntity[]>;
    getProductById(id: any): Promise<import("../../Global/Entities/product.entity").ProductEntity>;
    deleteProductById(id: number): Promise<import("typeorm").DeleteResult>;
    deleteSizeById(id: number): Promise<import("typeorm").DeleteResult>;
    createNewSize(id: any, session: any, myDto: any): Promise<import("../../Global/Entities/size.entity").SizeEntity[]>;
    addProductFunc(mydata: any, imageobj: Express.Multer.File): Promise<import("../../Global/Entities/product.entity").ProductEntity[]>;
    updateAdmin(myDto: AdminForm, file: Express.Multer.File): Promise<"Admin not found" | "Admin updated" | "Update failed">;
    createNewWish(myDto: any): Promise<import("../../Global/Entities/wish.entity").WishEntity[]>;
    getImages(name: any, res: any): void;
}
