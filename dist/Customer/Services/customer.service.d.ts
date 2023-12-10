import CustomerForm from '../DTOs/customerform.dto';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../Entities/customer.entity';
export declare class CustomerService {
    private userRepository;
    constructor(userRepository: Repository<CustomerEntity>);
    createUser(myDto: CustomerForm): Promise<CustomerForm & CustomerEntity>;
}
