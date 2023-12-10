import { ProductEntity } from './product.entity';
export declare class ProductPictureEntity {
    id: number;
    filename: string;
    isThumbnail: boolean;
    isFeatured: boolean;
    product: [ProductEntity];
}
