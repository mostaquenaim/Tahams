import { DeliveryStatusEntity } from './deliveryStatus.entity';
import { CartsEntity } from './cart.entity';
import { PaymentMethodEntity } from './paymentMethod.entity';
export declare class BuyingHistoryEntity {
    id: number;
    trackingToken: string;
    address: string;
    region: string;
    city: string;
    phone_no: string;
    deliveryFee: number;
    BuyingDate: Date;
    receivedDate: Date;
    processedDate: Date;
    readyToShipDate: Date;
    droppedOffDate: Date;
    outDate: Date;
    deliveredDate: Date;
    cancelDate: Date;
    returnDate: Date;
    checkedDate: Date;
    PaymentDetails: string;
    isChecked: boolean;
    screenshot: string;
    PaymentDone: boolean;
    deliveryStatus: DeliveryStatusEntity;
    paymentMethod: PaymentMethodEntity;
    carts: CartsEntity[];
}
