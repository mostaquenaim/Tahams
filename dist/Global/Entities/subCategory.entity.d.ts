import { CategoryEntity } from './category.entity';
import { SubSubCategoryEntity } from './subSubCategory.entity';
export declare class SubCategoryEntity {
    id: number;
    categoryName: string;
    filename: string;
    category: CategoryEntity;
    subSubs: SubSubCategoryEntity;
}
