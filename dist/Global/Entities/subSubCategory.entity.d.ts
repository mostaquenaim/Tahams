import { ProductEntity } from './product.entity';
import { SubCategoryEntity } from './subCategory.entity';
export declare class SubSubCategoryEntity {
    id: number;
    categoryName: string;
    filename: string;
    products: ProductEntity[];
    category: SubCategoryEntity;
}
