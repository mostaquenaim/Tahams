import { EmployeeForm } from '../DTOs/employeeform.dto';
import { Repository } from 'typeorm';
import { EmployeeEntity } from '../Entities/employee.entity';
export declare class EmployeeService {
    private userRepository;
    constructor(userRepository: Repository<EmployeeEntity>);
    getHello(): string;
    getName(): string;
    createUser(createUserDto: EmployeeForm): EmployeeForm;
}
