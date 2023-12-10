import { DeliveryStatusEntity } from './deliveryStatus.entity';
import { CartsEntity } from './cart.entity';
import { PaymentMethodEntity } from './paymentMethod.entity';
export declare class BuyingHistoryEntity {
    id: number;
    trackingToken: string;
    Address: string;
    phone_no: string;
    BuyingDate: Date;
    PaymentDetails: string;
    PaymentDone: boolean;
    deliveryStatus: DeliveryStatusEntity;
    paymentMethod: PaymentMethodEntity;
    carts: CartsEntity[];
}
