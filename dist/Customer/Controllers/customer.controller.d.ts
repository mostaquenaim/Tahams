import { CustomerService } from '../Services/customer.service';
import CustomerForm from '../DTOs/customerform.dto';
export declare class CustomerController {
    private readonly appService;
    constructor(appService: CustomerService);
    createUser(createUser: CustomerForm): Promise<CustomerForm & import("../Entities/customer.entity").CustomerEntity>;
    getImages(name: any, res: any): void;
}
