import { CategoryEntity } from './category.entity';
import { SubSubCategoryEntity } from './subSubCategory.entity';
export declare class SubCategoryEntity {
    id: number;
    name: string;
    filename: string;
    category: CategoryEntity;
    subSubs: SubSubCategoryEntity;
}
