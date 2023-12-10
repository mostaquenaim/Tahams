import { SubCategoryEntity } from './subCategory.entity';
import { BannerEntity } from './banner.entity';
export declare class CategoryEntity {
    id: number;
    categoryName: string;
    filename: string;
    subs: SubCategoryEntity[];
    banners: BannerEntity[];
}
