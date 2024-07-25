import { ColorSizeEntity } from './color-size-combined.entity';
import { ProductSizeCategoryEntity } from './productSizeCategory.entity';
export declare class SizeEntity {
    id: number;
    name: string;
    colorsize: ColorSizeEntity[];
    pscs: ProductSizeCategoryEntity[];
}
