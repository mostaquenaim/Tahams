import { ProductEntity } from './product.entity';
import { SizeEntity } from './size.entity';
import { SubSubCategoryEntity } from './subSubCategory.entity';
export declare class ProductSizeCategoryEntity {
    id: number;
    product: ProductEntity;
    category: SubSubCategoryEntity;
    size: SizeEntity;
    quantity: number;
}
