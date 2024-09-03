import { BuyingHistoryEntity } from './buyingHistory.entity';
export declare class PaymentInfo {
    id: number;
    bankName: string;
    accountNumber: string;
    mobileNumber: string;
    screenshot: string;
    buyingHistory: BuyingHistoryEntity;
}
