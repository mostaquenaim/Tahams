import { ColorEntity } from './colors.entity';
import { CartsEntity } from './cart.entity';
import { WishEntity } from './wish.entity';
import { SubSubCategoryEntity } from './subSubCategory.entity';
import { ProductPictureEntity } from './product-pictures.entity';
export declare class ProductEntity {
    id: number;
    name: string;
    serialNo: string;
    note: string;
    purchaseDate: Date;
    vatPercentage: number;
    discountPercentage: number;
    buyingPrice: number;
    sellingPrice: number;
    tags: string;
    description: string;
    ifStock: boolean;
    filename: string;
    subCategories: SubSubCategoryEntity[];
    color: ColorEntity;
    productPictures: ProductPictureEntity[];
    carts: CartsEntity[];
    wishes: WishEntity[];
}
