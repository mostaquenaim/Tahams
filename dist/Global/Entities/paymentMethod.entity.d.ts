import { BuyingHistoryEntity } from './buyingHistory.entity';
export declare class PaymentMethodEntity {
    id: number;
    name: string;
    buyingHistories: BuyingHistoryEntity[];
}
