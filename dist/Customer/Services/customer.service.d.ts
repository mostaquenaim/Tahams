import CustomerForm from '../DTOs/customerform.dto';
import { Repository } from 'typeorm';
import { UserEntity } from '../../Global/Entities/user.entity';
export declare class CustomerService {
    private userRepository;
    constructor(userRepository: Repository<UserEntity>);
    createUser(myDto: CustomerForm): Promise<CustomerForm & UserEntity>;
}
