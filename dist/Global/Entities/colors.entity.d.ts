import { ProductEntity } from './product.entity';
import { ColorSizeEntity } from './color-size-combined.entity';
export declare class ColorEntity {
    id: number;
    name: string;
    colorCode: string;
    quantity: number;
    product: ProductEntity;
    colorsize: ColorSizeEntity[];
}
