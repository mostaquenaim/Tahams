import { CartsEntity } from 'src/Global/Entities/cart.entity';
import { WishEntity } from 'src/Global/Entities/wish.entity';
export declare class UserEntity {
    id: number;
    name: string;
    uniqueId: string;
    password: string;
    email: string;
    role: string;
    mbl_no: string;
    filename: string;
    address: string;
    city: string;
    region: string;
    state: string;
    postal_code: string;
    date_of_birth: Date;
    gender: string;
    loggedInWith: string;
    created_at: Date;
    updated_at: Date;
    carts: CartsEntity[];
    wishes: WishEntity[];
}
