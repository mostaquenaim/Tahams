import { CartsEntity } from 'src/Global/Entities/cart.entity';
import { WishEntity } from 'src/Global/Entities/wish.entity';
export declare class CustomerEntity {
    id: number;
    name: string;
    uniqueId: string;
    password: string;
    email: string;
    mbl_no: string;
    filename: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    date_of_birth: Date;
    gender: string;
    created_at: Date;
    updated_at: Date;
    carts: CartsEntity[];
    wishes: WishEntity[];
}
