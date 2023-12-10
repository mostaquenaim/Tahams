import { CategoryEntity } from './category.entity';
export declare class BannerEntity {
    id: number;
    title: string;
    description: string;
    filename: string;
    isEnable: boolean;
    startDate: Date;
    endDate: Date;
    platform: string;
    category: CategoryEntity | null;
}
