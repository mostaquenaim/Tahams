import { AdminForm } from '../DTOs/adminform.dto';
import { Repository } from 'typeorm';
import { AdminEntity } from '../Entities/admin.entity';
import { CustomerEntity } from 'src/Customer/Entities/customer.entity';
import { ProductEntity } from 'src/Global/Entities/product.entity';
import { BannerEntity } from 'src/Global/Entities/banner.entity';
import { MailerService } from "@nestjs-modules/mailer/dist";
import { CategoryEntity } from 'src/Global/Entities/category.entity';
import { SizeEntity } from 'src/Global/Entities/size.entity';
import { SubCategoryEntity } from 'src/Global/Entities/subCategory.entity';
import { CouponEntity } from 'src/Global/Entities/coupon.entity';
import { ColorEntity } from 'src/Global/Entities/colors.entity';
import { ProductPictureEntity } from 'src/Global/Entities/product-pictures.entity';
import { WishEntity } from 'src/Global/Entities/wish.entity';
import { CartsEntity } from 'src/Global/Entities/cart.entity';
import { BuyingHistoryEntity } from 'src/Global/Entities/buyingHistory.entity';
import { DeliveryStatusEntity } from 'src/Global/Entities/deliveryStatus.entity';
import { PaymentMethodEntity } from 'src/Global/Entities/paymentMethod.entity';
import { SubSubCategoryEntity } from 'src/Global/Entities/subSubCategory.entity';
import { ColorSizeEntity } from 'src/Global/Entities/color-size-combined.entity';
import { PaymentInfo } from 'src/Global/Entities/paymentInfo.entity';
export declare class AdminService {
    private adminRepo;
    private mailerService;
    private customerRepo;
    private productRepo;
    private productPicRepo;
    private bannerRepo;
    private paymentInfoRepo;
    private categoryRepo;
    private couponRepo;
    private colorRepo;
    private subCategoryRepo;
    private subSubCategoryRepo;
    private sizeRepo;
    private wishRepo;
    private cartRepo;
    private buyingHistoryRepo;
    private deliveryStatusRepo;
    private paymentMethodRepo;
    private colorSizeRepo;
    constructor(adminRepo: Repository<AdminEntity>, mailerService: MailerService, customerRepo: Repository<CustomerEntity>, productRepo: Repository<ProductEntity>, productPicRepo: Repository<ProductPictureEntity>, bannerRepo: Repository<BannerEntity>, paymentInfoRepo: Repository<PaymentInfo>, categoryRepo: Repository<CategoryEntity>, couponRepo: Repository<CouponEntity>, colorRepo: Repository<ColorEntity>, subCategoryRepo: Repository<SubCategoryEntity>, subSubCategoryRepo: Repository<SubSubCategoryEntity>, sizeRepo: Repository<SizeEntity>, wishRepo: Repository<WishEntity>, cartRepo: Repository<CartsEntity>, buyingHistoryRepo: Repository<BuyingHistoryEntity>, deliveryStatusRepo: Repository<DeliveryStatusEntity>, paymentMethodRepo: Repository<PaymentMethodEntity>, colorSizeRepo: Repository<ColorSizeEntity>);
    addBanner(myDto: any): Promise<any>;
    addPaymentInfo(myDto: any): Promise<any>;
    createUser(myDto: any): Promise<any>;
    sendEmail(mydto: any): Promise<SentMessageInfo>;
    signIn(myDto: any): Promise<boolean | 0>;
    updateAdmin(myDto: AdminForm, email: string): Promise<"Admin not found" | "Admin updated" | "Update failed">;
    deleteBanner(id: number): Promise<import("typeorm").DeleteResult>;
    deleteCartItem(id: any): Promise<import("typeorm").DeleteResult>;
    deleteCarts(cartArray: string[], email: string): Promise<CartsEntity[]>;
    addNewProduct(myDto: any): Promise<ProductEntity[]>;
    viewAllProduct(): Promise<ProductEntity[]>;
    getAllBuyingHistories(email: any): Promise<unknown[]>;
    getAllCoupons(): Promise<CouponEntity[]>;
    getAllDeliveryStatus(): Promise<DeliveryStatusEntity[]>;
    getAllPaymentMethod(): Promise<PaymentMethodEntity[]>;
    getParticularCoupon(id: any): Promise<CouponEntity>;
    disableCoupon(id: any): Promise<void>;
    getAllCarts(email: any): Promise<CartsEntity[]>;
    viewAllBanners(): Promise<BannerEntity[]>;
    viewColors(): Promise<ColorEntity[]>;
    viewProductCategories(): Promise<CategoryEntity[]>;
    viewAllProductSubSubCategories(): Promise<SubSubCategoryEntity[]>;
    viewAllProductSubCategories(): Promise<SubCategoryEntity[]>;
    viewProductSubCategories(id: number): Promise<SubCategoryEntity[]>;
    viewProductSubSubCategories(id: number): Promise<SubSubCategoryEntity[]>;
    viewProductSizes(): Promise<SizeEntity[]>;
    getCategoryById(id: any): Promise<CategoryEntity>;
    getSubSubCategoryById(id: any): Promise<SubSubCategoryEntity>;
    getProductFtImage(productId: any): Promise<ProductPictureEntity>;
    getBannerById(id: any): Promise<BannerEntity>;
    getSizeById(id: any): Promise<SizeEntity>;
    getCartById(id: any): Promise<CartsEntity>;
    getProductById(id: number): Promise<ProductEntity>;
    getPaymentMethodById(id: any): Promise<PaymentMethodEntity>;
    getColorById(id: any): Promise<ColorEntity>;
    getCustomerById(id: any): Promise<CustomerEntity>;
    getCustomerByEmail(email: any): Promise<CustomerEntity>;
    getColorByName(name: string): Promise<ColorEntity>;
    getDeliveryStatusById(id: any): Promise<DeliveryStatusEntity>;
    getCouponById(id: any): Promise<CouponEntity>;
    getBuyingHistoryByToken(token: any): Promise<BuyingHistoryEntity>;
    getProductByCat(name: any): Promise<void>;
    getProductBySubSubCatId(subCategoryId: any): Promise<ProductEntity[]>;
    updateCategory(id: number, category: any): Promise<void>;
    updateBanner(id: number, bannerDto: any): Promise<void>;
    updateBuyingHistory(token: any, details: any, email: any): Promise<BuyingHistoryEntity>;
    deleteProductById(id: number): Promise<import("typeorm").DeleteResult>;
    deleteSizeById(id: number): Promise<import("typeorm").DeleteResult>;
    createNewCategory(myDto: any): Promise<CategoryEntity[]>;
    createNewCoupon(myDto: any): Promise<CouponEntity[]>;
    createNewSubCategory(myDto: any): Promise<SubCategoryEntity[]>;
    createNewSize(myDto: any): Promise<SizeEntity[]>;
    createNewBuy(myDto: any): Promise<BuyingHistoryEntity[]>;
    customerLogin(myDto: any): Promise<any>;
    createNewCart(myDto: any): Promise<CartsEntity[]>;
    createNewCartObject(product: any, cartsData: any): Promise<boolean>;
    createNewWish(myDto: any): Promise<WishEntity[]>;
    createNewProduct(myDto: any): Promise<ProductEntity[]>;
    addProductPictures(myDto: any): Promise<boolean>;
    createNewFileObject(product: any, filesData: any): Promise<boolean>;
    changeCategoryImage(id: any, myFile: any): Promise<CategoryEntity>;
    changeBannerImage(id: number, myFile: string): Promise<BannerEntity>;
}
