import { SubCategoryEntity } from './subCategory.entity';
import { ProductSizeCategoryEntity } from './productSizeCategory.entity';
export declare class SubSubCategoryEntity {
    id: number;
    categoryName: string;
    filename: string;
    category: SubCategoryEntity;
    pscs: ProductSizeCategoryEntity[];
}
