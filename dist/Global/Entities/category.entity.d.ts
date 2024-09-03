import { SubCategoryEntity } from './subCategory.entity';
import { BannerEntity } from './banner.entity';
export declare class CategoryEntity {
    id: number;
    name: string;
    filename: string;
    subs: SubCategoryEntity[];
    banners: BannerEntity[];
}
