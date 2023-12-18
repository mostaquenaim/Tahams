import { ProductEntity } from './product.entity';
export declare class ColorEntity {
    id: number;
    name: string;
    colorCode: string;
    quantity: number;
    products: ProductEntity[];
}
