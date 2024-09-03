import { SubCategoryEntity } from './subCategory.entity';
import { ProductSizeCategoryEntity } from './productSizeCategory.entity';
import { CartsEntity } from './cart.entity';
export declare class SubSubCategoryEntity {
    id: number;
    name: string;
    filename: string;
    category: SubCategoryEntity;
    pscs: ProductSizeCategoryEntity[];
    carts: CartsEntity[];
}
