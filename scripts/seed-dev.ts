// Development-only sample data seeder.
//
// Populates every major entity in the schema with realistic sample data so the
// admin panel (and the storefront it powers) has something to show on a fresh
// database. Safe to re-run: every insert is guarded by an existence check, so
// running it twice does not create duplicates.
//
// Usage: npm run seed:dev
//
// NEVER run this against a production database - it inserts fake customers,
// fake orders and placeholder image filenames that do not exist on disk.

import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../src/app.module';

import { UserEntity } from '../src/Global/Entities/user.entity';
import { AdminEntity } from '../src/Admin/Entities/admin.entity';
import { EmployeeEntity } from '../src/Employee/Entities/employee.entity';
import { RoleEntity } from '../src/Global/Entities/roles.entity';
import { GenderEntity } from '../src/Global/Entities/gender.entity';
import { CategoryEntity } from '../src/Global/Entities/category.entity';
import { SubCategoryEntity } from '../src/Global/Entities/subCategory.entity';
import { SubSubCategoryEntity } from '../src/Global/Entities/subSubCategory.entity';
import { ColorEntity } from '../src/Global/Entities/colors.entity';
import { SizeEntity } from '../src/Global/Entities/size.entity';
import { ColorSizeEntity } from '../src/Global/Entities/color-size-combined.entity';
import { FabricEntity } from '../src/Global/Entities/fabrics.entity';
import { ProductEntity } from '../src/Global/Entities/product.entity';
import { ProductPictureEntity } from '../src/Global/Entities/product-pictures.entity';
import { ProductSizeCategoryEntity } from '../src/Global/Entities/productSizeCategory.entity';
import { CouponEntity } from '../src/Global/Entities/coupon.entity';
import { BannerEntity } from '../src/Global/Entities/banner.entity';
import { PopUpEntity } from '../src/Global/Entities/pop-up.entity';
import { ActivePopUpEntity } from '../src/Global/Entities/active-pop-up.entity';
import { NewArrivalEntity } from '../src/Global/Entities/new-arrival.entity';
import { PaymentMethodEntity } from '../src/Global/Entities/paymentMethod.entity';
import { DeliveryStatusEntity } from '../src/Global/Entities/deliveryStatus.entity';
import { CompanyEntity } from '../src/Global/Entities/companyInfo.entity';
import { PartnerEntity } from '../src/Global/Entities/partner.entity';
import { CartsEntity } from '../src/Global/Entities/cart.entity';
import { WishEntity } from '../src/Global/Entities/wish.entity';
import { BuyingHistoryEntity } from '../src/Global/Entities/buyingHistory.entity';
import { CourierInfo } from '../src/Global/Entities/courier-info.entity';
import { PaymentInfo } from '../src/Global/Entities/paymentInfo.entity';
import {
  CustomizationRequestEntity,
  RequestStatus,
  Side,
} from '../src/Global/Entities/customization-request.entity';
import { CustomTextElement } from '../src/Global/Entities/custom-text-element';
import { CustomImgElement } from '../src/Global/Entities/custom-img-element';
import { MessageEntity } from '../src/Global/Entities/messages.entity';
import { UnreadMessageEntity } from '../src/Global/Entities/unreadMessage.entity';
import { ActivityEntity } from '../src/Global/Entities/activity.entity';
import { CustomerActivityEntity } from '../src/Global/Entities/customer-activity.entity';
import { ViewProductEntity } from '../src/Global/Entities/viewProduct.entity';
import { ReturnEntity } from '../src/Global/Entities/return.entity';

// Finds one row matching `where`; creates it with `data` if none exists.
// Every seed call below is wrapped in this so the script is safe to re-run.
async function upsert<T extends Record<string, any>>(
  repo: Repository<T>,
  where: any,
  data: any,
): Promise<T> {
  const existing = await repo.findOne({ where });
  if (existing) return existing;
  const entity = repo.create(data);
  return repo.save(entity as any) as any;
}

async function run() {
  if (process.env.NODE_ENV === 'production') {
    console.error(
      'Refusing to run: NODE_ENV=production. This script inserts fake sample data and must only run in development.',
    );
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const userRepo = app.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    const adminRepo = app.get<Repository<AdminEntity>>(getRepositoryToken(AdminEntity));
    const employeeRepo = app.get<Repository<EmployeeEntity>>(getRepositoryToken(EmployeeEntity));
    const roleRepo = app.get<Repository<RoleEntity>>(getRepositoryToken(RoleEntity));
    const genderRepo = app.get<Repository<GenderEntity>>(getRepositoryToken(GenderEntity));
    const categoryRepo = app.get<Repository<CategoryEntity>>(getRepositoryToken(CategoryEntity));
    const subCategoryRepo = app.get<Repository<SubCategoryEntity>>(getRepositoryToken(SubCategoryEntity));
    const subSubCategoryRepo = app.get<Repository<SubSubCategoryEntity>>(getRepositoryToken(SubSubCategoryEntity));
    const colorRepo = app.get<Repository<ColorEntity>>(getRepositoryToken(ColorEntity));
    const sizeRepo = app.get<Repository<SizeEntity>>(getRepositoryToken(SizeEntity));
    const colorSizeRepo = app.get<Repository<ColorSizeEntity>>(getRepositoryToken(ColorSizeEntity));
    const fabricRepo = app.get<Repository<FabricEntity>>(getRepositoryToken(FabricEntity));
    const productRepo = app.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));
    const productPicRepo = app.get<Repository<ProductPictureEntity>>(getRepositoryToken(ProductPictureEntity));
    const pscRepo = app.get<Repository<ProductSizeCategoryEntity>>(getRepositoryToken(ProductSizeCategoryEntity));
    const couponRepo = app.get<Repository<CouponEntity>>(getRepositoryToken(CouponEntity));
    const bannerRepo = app.get<Repository<BannerEntity>>(getRepositoryToken(BannerEntity));
    const popUpRepo = app.get<Repository<PopUpEntity>>(getRepositoryToken(PopUpEntity));
    const activePopUpRepo = app.get<Repository<ActivePopUpEntity>>(getRepositoryToken(ActivePopUpEntity));
    const newArrivalRepo = app.get<Repository<NewArrivalEntity>>(getRepositoryToken(NewArrivalEntity));
    const paymentMethodRepo = app.get<Repository<PaymentMethodEntity>>(getRepositoryToken(PaymentMethodEntity));
    const deliveryStatusRepo = app.get<Repository<DeliveryStatusEntity>>(getRepositoryToken(DeliveryStatusEntity));
    const companyRepo = app.get<Repository<CompanyEntity>>(getRepositoryToken(CompanyEntity));
    const partnerRepo = app.get<Repository<PartnerEntity>>(getRepositoryToken(PartnerEntity));
    const cartRepo = app.get<Repository<CartsEntity>>(getRepositoryToken(CartsEntity));
    const wishRepo = app.get<Repository<WishEntity>>(getRepositoryToken(WishEntity));
    const buyingHistoryRepo = app.get<Repository<BuyingHistoryEntity>>(getRepositoryToken(BuyingHistoryEntity));
    const courierRepo = app.get<Repository<CourierInfo>>(getRepositoryToken(CourierInfo));
    const paymentInfoRepo = app.get<Repository<PaymentInfo>>(getRepositoryToken(PaymentInfo));
    const customReqRepo = app.get<Repository<CustomizationRequestEntity>>(getRepositoryToken(CustomizationRequestEntity));
    const customTextRepo = app.get<Repository<CustomTextElement>>(getRepositoryToken(CustomTextElement));
    const customImgRepo = app.get<Repository<CustomImgElement>>(getRepositoryToken(CustomImgElement));
    const messageRepo = app.get<Repository<MessageEntity>>(getRepositoryToken(MessageEntity));
    const unreadRepo = app.get<Repository<UnreadMessageEntity>>(getRepositoryToken(UnreadMessageEntity));
    const activityRepo = app.get<Repository<ActivityEntity>>(getRepositoryToken(ActivityEntity));
    const customerActivityRepo = app.get<Repository<CustomerActivityEntity>>(getRepositoryToken(CustomerActivityEntity));
    const viewRepo = app.get<Repository<ViewProductEntity>>(getRepositoryToken(ViewProductEntity));
    const returnRepo = app.get<Repository<ReturnEntity>>(getRepositoryToken(ReturnEntity));

    // ---------------------------------------------------------------------
    // Roles
    // ---------------------------------------------------------------------
    console.log('Seeding roles...');
    const roleNames = ['admin', 'manager', 'employee', 'customer'];
    const roles: Record<string, RoleEntity> = {};
    for (const name of roleNames) {
      roles[name] = await upsert(roleRepo, { name }, { name });
    }

    // ---------------------------------------------------------------------
    // Admin + employees + customers
    // ---------------------------------------------------------------------
    console.log('Seeding users (admin, employees, customers)...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'securepassword';
    const adminName = process.env.ADMIN_NAME || 'Admin';
    const adminHash = await bcrypt.hash(adminPassword, await bcrypt.genSalt());

    const adminUser = await upsert(
      userRepo,
      { email: adminEmail },
      {
        name: adminName,
        email: adminEmail,
        password: adminHash,
        role: 'admin',
        mbl_no: '01700000000',
      },
    );

    // Mirrors the `admin` table so PUT /admin/updateProfile (which reads/writes
    // this table by email) has a row to update.
    await upsert(
      adminRepo,
      { email: adminEmail },
      {
        name: adminName,
        uname: 'admin',
        email: adminEmail,
        password: adminHash,
        mbl_no: '01700000000',
      },
    );

    const employeeSeed = [
      { name: 'Rafiul Islam', email: 'employee1@tahams.dev', mbl_no: '01711111111' },
      { name: 'Sabrina Akter', email: 'employee2@tahams.dev', mbl_no: '01722222222' },
    ];
    const employees: EmployeeEntity[] = [];
    for (const emp of employeeSeed) {
      const hash = await bcrypt.hash('Employee@123', await bcrypt.genSalt());
      employees.push(
        await upsert(
          employeeRepo,
          { email: emp.email },
          { ...emp, password: hash },
        ),
      );
    }

    const customerSeed = [
      {
        name: 'Tanvir Ahmed',
        email: 'customer1@tahams.dev',
        mbl_no: '01812345671',
        address: 'House 12, Road 5, Dhanmondi',
        city: 'Dhaka',
        region: 'Dhaka',
        state: 'Dhaka Division',
        postal_code: '1209',
        gender: 'Male',
      },
      {
        name: 'Mim Chowdhury',
        email: 'customer2@tahams.dev',
        mbl_no: '01812345672',
        address: 'Flat 3B, GEC Circle',
        city: 'Chattogram',
        region: 'Chattogram',
        state: 'Chattogram Division',
        postal_code: '4000',
        gender: 'Female',
      },
      {
        name: 'Fahim Reza',
        email: 'customer3@tahams.dev',
        mbl_no: '01812345673',
        address: 'Uposhohor, Zindabazar',
        city: 'Sylhet',
        region: 'Sylhet',
        state: 'Sylhet Division',
        postal_code: '3100',
        gender: 'Male',
      },
    ];
    const customers: UserEntity[] = [];
    for (const cust of customerSeed) {
      const hash = await bcrypt.hash('Customer@123', await bcrypt.genSalt());
      customers.push(
        await upsert(
          userRepo,
          { email: cust.email },
          { ...cust, password: hash, role: 'customer' },
        ),
      );
    }
    const [customer1, customer2, customer3] = customers;

    // ---------------------------------------------------------------------
    // Genders
    // ---------------------------------------------------------------------
    console.log('Seeding genders...');
    const genderNames = ['Men', 'Women', 'Unisex'];
    const genders: Record<string, GenderEntity> = {};
    for (const name of genderNames) {
      genders[name] = await upsert(genderRepo, { name }, { name });
    }

    // ---------------------------------------------------------------------
    // Categories / SubCategories / SubSubCategories
    // ---------------------------------------------------------------------
    console.log('Seeding categories...');
    const categorySeed = [
      { name: 'T-Shirts', isGenderVaried: true, isForMen: true, isForWomen: true, filename: 'seed-placeholder/category-tshirts.jpg' },
      { name: 'Polo Shirts', isGenderVaried: true, isForMen: true, isForWomen: true, filename: 'seed-placeholder/category-polo.jpg' },
      { name: 'Hoodies', isGenderVaried: false, isForMen: true, isForWomen: true, filename: 'seed-placeholder/category-hoodies.jpg' },
      { name: 'Caps & Accessories', isGenderVaried: false, isForMen: true, isForWomen: true, filename: 'seed-placeholder/category-accessories.jpg' },
    ];
    const categories: Record<string, CategoryEntity> = {};
    for (const cat of categorySeed) {
      const saved = await upsert(categoryRepo, { name: cat.name }, { ...cat, serial: 0 });
      if (!saved.serial) {
        saved.serial = saved.id;
        await categoryRepo.save(saved);
      }
      categories[cat.name] = saved;
    }

    console.log('Seeding sub-categories...');
    const subCategorySeed = [
      { name: 'Graphic Tees', category: 'T-Shirts' },
      { name: 'Plain Tees', category: 'T-Shirts' },
      { name: 'Classic Polo', category: 'Polo Shirts' },
      { name: 'Premium Polo', category: 'Polo Shirts' },
      { name: 'Pullover Hoodies', category: 'Hoodies' },
      { name: 'Zip-Up Hoodies', category: 'Hoodies' },
      { name: 'Caps', category: 'Caps & Accessories' },
      { name: 'Tote Bags', category: 'Caps & Accessories' },
    ];
    const subCategories: Record<string, SubCategoryEntity> = {};
    for (const sub of subCategorySeed) {
      subCategories[sub.name] = await upsert(
        subCategoryRepo,
        { name: sub.name, category: { id: categories[sub.category].id } },
        {
          name: sub.name,
          filename: 'seed-placeholder/subcategory.jpg',
          category: categories[sub.category],
        },
      );
    }

    console.log('Seeding sub-sub-categories...');
    const subSubCategorySeed = [
      { name: "Men's Graphic Tees", subCategory: 'Graphic Tees', gender: 'Men', isRegular: true },
      { name: "Women's Graphic Tees", subCategory: 'Graphic Tees', gender: 'Women', isRegular: true },
      { name: "Men's Plain Tees", subCategory: 'Plain Tees', gender: 'Men', isRegular: true },
      { name: "Women's Plain Tees", subCategory: 'Plain Tees', gender: 'Women', isRegular: true },
      { name: "Men's Classic Polo", subCategory: 'Classic Polo', gender: 'Men', isRegular: true },
      { name: "Men's Premium Polo", subCategory: 'Premium Polo', gender: 'Men', isPremium: true },
      { name: 'Unisex Pullover Hoodies', subCategory: 'Pullover Hoodies', gender: 'Unisex', isRegular: true },
      { name: 'Unisex Zip-Up Hoodies', subCategory: 'Zip-Up Hoodies', gender: 'Unisex', isRegular: true },
      { name: 'Unisex Caps', subCategory: 'Caps', gender: 'Unisex', isRegular: true },
      { name: 'Unisex Tote Bags', subCategory: 'Tote Bags', gender: 'Unisex', isRegular: true },
    ];
    const subSubCategories: Record<string, SubSubCategoryEntity> = {};
    for (const ssc of subSubCategorySeed) {
      subSubCategories[ssc.name] = await upsert(
        subSubCategoryRepo,
        { name: ssc.name },
        {
          name: ssc.name,
          filename: 'seed-placeholder/subsubcategory.jpg',
          isPremium: !!ssc.isPremium,
          isRegular: !!ssc.isRegular,
          category: subCategories[ssc.subCategory],
          gender: genders[ssc.gender],
        },
      );
    }

    // ---------------------------------------------------------------------
    // Colors / Sizes / Fabrics
    // ---------------------------------------------------------------------
    console.log('Seeding colors, sizes and fabrics...');
    const colorSeed = [
      { name: 'Black', colorCode: '#000000' },
      { name: 'White', colorCode: '#FFFFFF' },
      { name: 'Navy Blue', colorCode: '#001F54' },
      { name: 'Maroon', colorCode: '#800000' },
      { name: 'Royal Blue', colorCode: '#4169E1' },
      { name: 'Red', colorCode: '#FF0000' },
    ];
    const colors: Record<string, ColorEntity> = {};
    for (const c of colorSeed) {
      colors[c.name] = await upsert(colorRepo, { name: c.name }, c);
    }

    const sizeNames = ['S', 'M', 'L', 'XL', 'XXL'];
    const sizes: Record<string, SizeEntity> = {};
    for (const name of sizeNames) {
      sizes[name] = await upsert(sizeRepo, { name }, { name });
    }

    for (const name of sizeNames) {
      await upsert(colorSizeRepo, { size: name }, { size: name, quantity: 50 });
    }

    const fabricNames = ['Cotton', 'Polyester', 'Cotton-Polyester Blend', 'PK Fabric', 'Fleece'];
    const fabrics: Record<string, FabricEntity> = {};
    for (const name of fabricNames) {
      fabrics[name] = await upsert(fabricRepo, { name }, { name });
    }

    // ---------------------------------------------------------------------
    // Products, pictures and size/quantity breakdown
    // ---------------------------------------------------------------------
    console.log('Seeding products...');
    const productSeed = [
      {
        productId: 'tahams-classic-crew-neck-tee-001',
        name: 'Classic Crew Neck Tee',
        serialNo: 'SN-TSH-001',
        color: 'Black',
        fabric: 'Cotton',
        subSub: "Men's Plain Tees",
        description: 'A wardrobe staple - soft 180 GSM cotton crew neck tee.',
        longDescription: 'Everyday essential crew neck tee made from 180 GSM combed cotton for a soft handfeel, breathable comfort and a fade-resistant fit that holds up wash after wash.',
        buyingPrice: 350,
        sellingPrice: 590,
        discountPercentage: 0,
        vatPercentage: 5,
        tags: 'tshirt,cotton,basics,men',
        totalViews: 120,
        salesCount: 34,
      },
      {
        productId: 'tahams-graphic-print-tee-wave-002',
        name: 'Graphic Print Tee - Wave',
        serialNo: 'SN-TSH-002',
        color: 'White',
        fabric: 'Cotton',
        subSub: "Men's Graphic Tees",
        description: 'Bold wave graphic print on premium cotton.',
        longDescription: 'Statement graphic tee featuring an original wave print, screen-printed with eco-friendly water-based ink onto 200 GSM cotton for a heavier, premium drape.',
        buyingPrice: 400,
        sellingPrice: 690,
        discountPercentage: 10,
        vatPercentage: 5,
        tags: 'tshirt,graphic,cotton,men',
        totalViews: 210,
        salesCount: 58,
      },
      {
        productId: 'tahams-floral-graphic-tee-003',
        name: 'Floral Graphic Tee',
        serialNo: 'SN-TSH-003',
        color: 'Maroon',
        fabric: 'Cotton',
        subSub: "Women's Graphic Tees",
        description: 'Hand-drawn floral graphic on a relaxed-fit tee.',
        longDescription: 'Relaxed-fit tee with an original hand-drawn floral graphic, printed on soft 180 GSM cotton with a crew neck and dropped shoulder silhouette.',
        buyingPrice: 380,
        sellingPrice: 650,
        discountPercentage: 0,
        vatPercentage: 5,
        tags: 'tshirt,graphic,women,floral',
        totalViews: 95,
        salesCount: 22,
      },
      {
        productId: 'tahams-classic-fit-polo-004',
        name: 'Classic Fit Polo',
        serialNo: 'SN-POL-001',
        color: 'Navy Blue',
        fabric: 'Cotton-Polyester Blend',
        subSub: "Men's Classic Polo",
        description: 'Everyday polo in a breathable cotton-poly pique blend.',
        longDescription: 'Classic three-button polo knitted from a 65/35 cotton-polyester pique blend for shape retention, breathability and easy care.',
        buyingPrice: 480,
        sellingPrice: 850,
        discountPercentage: 0,
        vatPercentage: 5,
        tags: 'polo,men,office-wear',
        totalViews: 140,
        salesCount: 41,
      },
      {
        productId: 'tahams-premium-pique-polo-005',
        name: 'Premium Pique Polo',
        serialNo: 'SN-POL-002',
        color: 'Royal Blue',
        fabric: 'PK Fabric',
        subSub: "Men's Premium Polo",
        description: 'Premium pique knit polo with a tailored fit.',
        longDescription: 'Elevated polo in a fine pique knit, tailored fit through the body with ribbed collar and cuffs and mother-of-pearl buttons.',
        buyingPrice: 650,
        sellingPrice: 1150,
        discountPercentage: 15,
        vatPercentage: 5,
        tags: 'polo,premium,men',
        totalViews: 88,
        salesCount: 19,
      },
      {
        productId: 'tahams-fleece-pullover-hoodie-006',
        name: 'Fleece Pullover Hoodie',
        serialNo: 'SN-HOD-001',
        color: 'Black',
        fabric: 'Fleece',
        subSub: 'Unisex Pullover Hoodies',
        description: 'Heavyweight fleece hoodie built for cool weather.',
        longDescription: 'Heavyweight 320 GSM brushed fleece pullover hoodie with a lined kangaroo pocket, ribbed cuffs and hem, and an adjustable drawstring hood.',
        buyingPrice: 850,
        sellingPrice: 1450,
        discountPercentage: 0,
        vatPercentage: 5,
        tags: 'hoodie,fleece,unisex,winter',
        totalViews: 175,
        salesCount: 47,
      },
    ];

    const products: Record<string, ProductEntity> = {};
    for (const p of productSeed) {
      let product = await productRepo.findOne({ where: { productId: p.productId } });
      if (!product) {
        product = productRepo.create({
          name: p.name,
          serialNo: p.serialNo,
          productId: p.productId,
          note: 'Seeded sample product for development.',
          purchaseDate: new Date(),
          vatPercentage: p.vatPercentage,
          discountPercentage: p.discountPercentage,
          buyingPrice: p.buyingPrice,
          sellingPrice: p.sellingPrice,
          tags: p.tags,
          description: p.description,
          longDescription: p.longDescription,
          ifStock: true,
          filename: `seed-placeholder/${p.productId}-main.jpg`,
          thumbImage: `seed-placeholder/${p.productId}-thumb.jpg`,
          publishable: true,
          totalViews: p.totalViews,
          salesCount: p.salesCount,
          color: colors[p.color],
          fabric: fabrics[p.fabric],
        });
        product = await productRepo.save(product);

        await productPicRepo.save([
          productPicRepo.create({
            filename: `seed-placeholder/${p.productId}-1.jpg`,
            thumb: `seed-placeholder/${p.productId}-1-thumb.jpg`,
            isThumbnail: true,
            isFeatured: true,
            product,
          }),
          productPicRepo.create({
            filename: `seed-placeholder/${p.productId}-2.jpg`,
            thumb: `seed-placeholder/${p.productId}-2-thumb.jpg`,
            isThumbnail: false,
            isFeatured: false,
            product,
          }),
        ]);

        const stockBySize = [
          { size: 'S', quantity: 15 },
          { size: 'M', quantity: 25 },
          { size: 'L', quantity: 20 },
          { size: 'XL', quantity: 10 },
        ];
        for (const stock of stockBySize) {
          await pscRepo.save(
            pscRepo.create({
              product,
              category: subSubCategories[p.subSub],
              size: sizes[stock.size],
              quantity: stock.quantity,
            }),
          );
        }
      }
      products[p.productId] = product;
    }
    const productList = Object.values(products);

    // ---------------------------------------------------------------------
    // Coupons
    // ---------------------------------------------------------------------
    console.log('Seeding coupons...');
    const couponSeed = [
      { name: 'WELCOME10', discountPercentage: 10, discountMoney: 0, limitAmount: 1000, minimumSpent: 500, isEnable: true },
      { name: 'SUMMER25', discountPercentage: 0, discountMoney: 200, limitAmount: 500, minimumSpent: 1000, isEnable: true },
      { name: 'FREESHIP', discountPercentage: 0, discountMoney: 60, limitAmount: 300, minimumSpent: 1500, isEnable: true },
    ];
    const coupons: Record<string, CouponEntity> = {};
    for (const c of couponSeed) {
      coupons[c.name] = await upsert(couponRepo, { name: c.name }, c);
    }

    // ---------------------------------------------------------------------
    // Banners
    // ---------------------------------------------------------------------
    console.log('Seeding banners...');
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const bannerSeed = [
      { title: 'New Season Tees', description: 'Fresh graphic tee drops, up to 20% off.', category: 'T-Shirts', platform: 'web' },
      { title: 'Hoodie Season Sale', description: 'Stay warm - fleece hoodies from 1450 BDT.', category: 'Hoodies', platform: 'web' },
      { title: 'Polo Collection', description: 'Office-ready polos for every occasion.', category: 'Polo Shirts', platform: 'mobile' },
    ];
    for (const b of bannerSeed) {
      await upsert(
        bannerRepo,
        { title: b.title },
        {
          title: b.title,
          description: b.description,
          filename: `seed-placeholder/banner-${b.category.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          isEnable: true,
          startDate: now,
          endDate: in30Days,
          platform: b.platform,
          category: categories[b.category],
        },
      );
    }

    // ---------------------------------------------------------------------
    // Pop-ups
    // ---------------------------------------------------------------------
    console.log('Seeding pop-ups...');
    const welcomePopUp = await upsert(
      popUpRepo,
      { title: 'Welcome Offer' },
      {
        title: 'Welcome Offer',
        filename: 'seed-placeholder/popup-welcome.jpg',
        url: '/collections/t-shirts',
        isActive: true,
        startDate: now,
        endDate: in30Days,
      },
    );
    await upsert(
      popUpRepo,
      { title: 'Eid Collection' },
      {
        title: 'Eid Collection',
        filename: 'seed-placeholder/popup-eid.jpg',
        url: '/collections/eid',
        isActive: false,
        startDate: now,
        endDate: in30Days,
      },
    );
    await upsert(
      activePopUpRepo,
      { popup: { id: welcomePopUp.id } },
      { popup: welcomePopUp },
    );

    // ---------------------------------------------------------------------
    // New arrivals
    // ---------------------------------------------------------------------
    console.log('Seeding new arrivals...');
    const newArrivalSeed = [
      { name: 'Graphic Print Tee - Wave', subSub: "Men's Graphic Tees", serial: '1' },
      { name: 'Premium Pique Polo', subSub: "Men's Premium Polo", serial: '2' },
      { name: 'Fleece Pullover Hoodie', subSub: 'Unisex Pullover Hoodies', serial: '3' },
    ];
    for (const arrival of newArrivalSeed) {
      await upsert(
        newArrivalRepo,
        { name: arrival.name },
        {
          name: arrival.name,
          description: `New arrival: ${arrival.name}`,
          serial: arrival.serial,
          isActive: true,
          category: arrival.subSub,
          filename: `seed-placeholder/new-arrival-${arrival.serial}.jpg`,
          subsub: subSubCategories[arrival.subSub],
        },
      );
    }

    // ---------------------------------------------------------------------
    // Payment methods / delivery statuses / company info / partners
    // ---------------------------------------------------------------------
    console.log('Seeding payment methods, delivery statuses, company info and partners...');
    const paymentMethodNames = ['Cash on Delivery', 'bKash', 'Nagad', 'Card Payment'];
    const paymentMethods: Record<string, PaymentMethodEntity> = {};
    for (const name of paymentMethodNames) {
      paymentMethods[name] = await upsert(paymentMethodRepo, { name }, { name });
    }

    const deliveryStatusNames = [
      'Pending',
      'Processing',
      'Ready to Ship',
      'Dropped Off',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Returned',
    ];
    const deliveryStatuses: Record<string, DeliveryStatusEntity> = {};
    for (const name of deliveryStatusNames) {
      deliveryStatuses[name] = await upsert(deliveryStatusRepo, { name }, { name });
    }

    await upsert(
      companyRepo,
      { isDefault: true },
      {
        name: 'Tahams',
        termsAndCo: 'By purchasing from Tahams you agree to our standard terms and conditions, including our exchange and return policy.',
        slogan: 'Wear Your Story',
        filename: 'seed-placeholder/company-logo.jpg',
        isDefault: true,
      },
    );

    const partnerSeed = [
      { name: 'Local Fabric Mill Ltd.', description: 'Primary cotton and fleece fabric supplier.' },
      { name: 'City Print House', description: 'Screen printing and embroidery partner for customization orders.' },
    ];
    for (const p of partnerSeed) {
      await upsert(
        partnerRepo,
        { name: p.name },
        { ...p, filename: `seed-placeholder/partner-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg` },
      );
    }

    // ---------------------------------------------------------------------
    // Delivery statuses used below
    // ---------------------------------------------------------------------
    const deliveredStatus = deliveryStatuses['Delivered'];
    const processingStatus = deliveryStatuses['Processing'];

    // ---------------------------------------------------------------------
    // Buying history (orders) + courier info + payment info
    // ---------------------------------------------------------------------
    console.log('Seeding orders (buying history, courier info, payment info)...');

    const order1Product = products['tahams-classic-crew-neck-tee-001'];
    const order1SubSub = subSubCategories["Men's Plain Tees"];
    let order1 = await buyingHistoryRepo.findOne({ where: { fullName: customer1.name, address: customer1.address } });
    if (!order1) {
      const courier1 = await courierRepo.save(
        courierRepo.create({
          courier_name: 'Pathao Courier',
          recipient_name: customer1.name,
          recipient_phone: customer1.mbl_no,
          delivery_address: customer1.address,
          consignment_id: `CN-${uuidv4().slice(0, 8).toUpperCase()}`,
          merchant_order_id: `ORD-${uuidv4().slice(0, 8).toUpperCase()}`,
          order_status: 'Delivered',
          delivery_fee: 60,
          tracking_number: `TRK-${uuidv4().slice(0, 10).toUpperCase()}`,
        }),
      );

      order1 = await buyingHistoryRepo.save(
        buyingHistoryRepo.create({
          isDraft: false,
          fullName: customer1.name,
          trackingToken: uuidv4(),
          address: customer1.address,
          region: customer1.region,
          city: customer1.city,
          phone_no: customer1.mbl_no,
          deliveryFee: 60,
          BuyingDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
          receivedDate: now,
          processedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          readyToShipDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
          droppedOffDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          outDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          deliveredDate: now,
          isChecked: true,
          PaymentDetails: 'Cash on Delivery - collected on delivery',
          PaymentDone: true,
          isPickup: false,
          deliveryStatus: deliveredStatus,
          paymentMethod: paymentMethods['Cash on Delivery'],
          courierInfo: courier1,
        }),
      );

      await cartRepo.save(
        cartRepo.create({
          uniqueId: uuidv4(),
          size: 'M',
          Quantity: 2,
          ProductName: order1Product.name,
          isBought: true,
          totalPrice: order1Product.sellingPrice * 2,
          category: order1SubSub,
          customer: customer1,
          product: order1Product,
          history: order1,
        }),
      );
    }

    const order2Product = products['tahams-classic-fit-polo-004'];
    const order2SubSub = subSubCategories["Men's Classic Polo"];
    let order2 = await buyingHistoryRepo.findOne({ where: { fullName: customer2.name, address: customer2.address } });
    if (!order2) {
      const courier2 = await courierRepo.save(
        courierRepo.create({
          courier_name: 'Pathao Courier',
          recipient_name: customer2.name,
          recipient_phone: customer2.mbl_no,
          delivery_address: customer2.address,
          consignment_id: `CN-${uuidv4().slice(0, 8).toUpperCase()}`,
          merchant_order_id: `ORD-${uuidv4().slice(0, 8).toUpperCase()}`,
          order_status: 'Processing',
          delivery_fee: 80,
          tracking_number: `TRK-${uuidv4().slice(0, 10).toUpperCase()}`,
        }),
      );

      order2 = await buyingHistoryRepo.save(
        buyingHistoryRepo.create({
          isDraft: false,
          fullName: customer2.name,
          trackingToken: uuidv4(),
          address: customer2.address,
          region: customer2.region,
          city: customer2.city,
          phone_no: customer2.mbl_no,
          deliveryFee: 80,
          BuyingDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          processedDate: now,
          isChecked: true,
          PaymentDetails: 'bKash transaction ID: 8N7K2P1Q3R',
          PaymentDone: true,
          isPickup: false,
          deliveryStatus: processingStatus,
          paymentMethod: paymentMethods['bKash'],
          courierInfo: courier2,
        }),
      );

      await paymentInfoRepo.save(
        paymentInfoRepo.create({
          mobileNumber: customer2.mbl_no,
          screenshot: 'seed-placeholder/payment-screenshot-bkash.jpg',
          buyingHistory: order2,
        }),
      );

      await cartRepo.save(
        cartRepo.create({
          uniqueId: uuidv4(),
          size: 'L',
          Quantity: 1,
          ProductName: order2Product.name,
          isBought: true,
          totalPrice: order2Product.sellingPrice,
          category: order2SubSub,
          customer: customer2,
          product: order2Product,
          history: order2,
        }),
      );
    }

    // ---------------------------------------------------------------------
    // Active (not-yet-checked-out) carts + wishlist
    // ---------------------------------------------------------------------
    console.log('Seeding active carts and wishlist...');

    const activeCart1Product = products['tahams-graphic-print-tee-wave-002'];
    await upsert(
      cartRepo,
      { customer: { id: customer1.id }, product: { id: activeCart1Product.id }, isBought: false },
      {
        uniqueId: uuidv4(),
        size: 'M',
        Quantity: 1,
        ProductName: activeCart1Product.name,
        isBought: false,
        totalPrice: activeCart1Product.sellingPrice,
        category: subSubCategories["Men's Graphic Tees"],
        customer: customer1,
        product: activeCart1Product,
      },
    );

    const activeCart2Product = products['tahams-fleece-pullover-hoodie-006'];
    await upsert(
      cartRepo,
      { customer: { id: customer3.id }, product: { id: activeCart2Product.id }, isBought: false },
      {
        uniqueId: uuidv4(),
        size: 'XL',
        Quantity: 1,
        ProductName: activeCart2Product.name,
        isBought: false,
        totalPrice: activeCart2Product.sellingPrice,
        category: subSubCategories['Unisex Pullover Hoodies'],
        customer: customer3,
        product: activeCart2Product,
        coupon: coupons['WELCOME10'],
      },
    );

    const wishProduct1 = products['tahams-floral-graphic-tee-003'];
    await upsert(
      wishRepo,
      { customer: { id: customer2.id }, product: { id: wishProduct1.id } },
      { customer: customer2, product: wishProduct1 },
    );
    const wishProduct2 = products['tahams-premium-pique-polo-005'];
    await upsert(
      wishRepo,
      { customer: { id: customer3.id }, product: { id: wishProduct2.id } },
      { customer: customer3, product: wishProduct2 },
    );

    // ---------------------------------------------------------------------
    // Customization request + elements
    // ---------------------------------------------------------------------
    console.log('Seeding a sample customization request...');
    let customReq = await customReqRepo.findOne({ where: { groupId: 'seed-custom-req-001' } });
    if (!customReq) {
      customReq = await customReqRepo.save(
        customReqRepo.create({
          color: 'Black',
          side: Side.FRONT,
          isChecked: false,
          previewImage: 'seed-placeholder/custom-preview-001.jpg',
          quantity: 12,
          size: 'L',
          printingMethod: 'Screen Print',
          status: RequestStatus.SUBMITTED,
          specialInstructions: 'Please keep the logo centered, 4 inches wide.',
          name: customer1.name,
          phone: customer1.mbl_no,
          address: customer1.address,
          groupId: 'seed-custom-req-001',
          user: customer1,
        }),
      );

      await customTextRepo.save(
        customTextRepo.create({
          content: 'TEAM TAHAMS',
          height: 60,
          width: 240,
          x: 120,
          y: 80,
          color: '#FFFFFF',
          fontFamily: 'Poppins',
          fontSize: 42,
          fontWeight: 'bold',
          rotation: 0,
          customReq,
        }),
      );

      await customImgRepo.save(
        customImgRepo.create({
          filename: 'seed-placeholder/custom-logo-001.png',
          height: 100,
          width: 100,
          x: 140,
          y: 150,
          rotation: 0,
          originalHeight: 400,
          originalWidth: 400,
          customReq,
        }),
      );
    }

    // ---------------------------------------------------------------------
    // Messages + unread counter
    // ---------------------------------------------------------------------
    console.log('Seeding messages...');
    const inquiryMsg = await upsert(
      messageRepo,
      { text: 'Hi, I wanted to ask about bulk pricing for custom hoodies.', sender: { id: customer1.id }, receiver: { id: adminUser.id } },
      {
        text: 'Hi, I wanted to ask about bulk pricing for custom hoodies.',
        isUrgent: false,
        isRead: false,
        sender: customer1,
        receiver: adminUser,
      },
    );
    await upsert(
      messageRepo,
      { text: 'Hello! Yes, we offer bulk discounts starting at 20 pieces. I will share a quote shortly.', sender: { id: adminUser.id }, receiver: { id: customer1.id } },
      {
        text: 'Hello! Yes, we offer bulk discounts starting at 20 pieces. I will share a quote shortly.',
        isUrgent: false,
        isRead: true,
        sender: adminUser,
        receiver: customer1,
      },
    );
    if (inquiryMsg) {
      await upsert(
        unreadRepo,
        { user: { id: adminUser.id } },
        { user: adminUser, quantity: 1 },
      );
    }

    // ---------------------------------------------------------------------
    // Activities
    // ---------------------------------------------------------------------
    console.log('Seeding activity log...');
    const activityNames = ['Account Registered', 'Product Viewed', 'Added to Wishlist', 'Order Placed'];
    const activities: Record<string, ActivityEntity> = {};
    for (const name of activityNames) {
      activities[name] = await upsert(activityRepo, { name }, { name });
    }
    for (const name of activityNames) {
      await upsert(
        customerActivityRepo,
        { activity: { id: activities[name].id } },
        { activity: activities[name] },
      );
    }

    // ---------------------------------------------------------------------
    // Product views
    // ---------------------------------------------------------------------
    console.log('Seeding product views...');
    const viewSeed = [
      { user: customer2, product: products['tahams-classic-crew-neck-tee-001'], count: 4 },
      { user: customer3, product: products['tahams-classic-fit-polo-004'], count: 7 },
      { user: customer1, product: products['tahams-graphic-print-tee-wave-002'], count: 2 },
    ];
    for (const v of viewSeed) {
      await upsert(
        viewRepo,
        { user: { id: v.user.id }, product: { id: v.product.id } },
        { user: v.user, product: v.product, count: v.count },
      );
    }

    // ---------------------------------------------------------------------
    // Return / cancellation request
    // ---------------------------------------------------------------------
    console.log('Seeding a sample return request...');
    const order1Cart = await cartRepo.findOne({ where: { history: { id: order1.id } } });
    if (order1Cart) {
      await upsert(
        returnRepo,
        { cart: { id: order1Cart.id } },
        {
          quantity: 1,
          isApproved: false,
          reason: 'Received wrong size, requesting exchange.',
          cart: order1Cart,
        },
      );
    }

    console.log('\nDevelopment seed complete.');
    console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
    console.log('Customer logins: customer1@tahams.dev, customer2@tahams.dev, customer3@tahams.dev (password: Customer@123)');
    console.log(`Seeded ${productList.length} products across ${Object.keys(categories).length} categories.`);
  } finally {
    await app.close();
  }
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
