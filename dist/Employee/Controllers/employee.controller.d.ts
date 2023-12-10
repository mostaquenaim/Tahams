/// <reference types="multer" />
import { EmployeeService } from '../Services/employee.service';
import { EmployeeForm } from '../DTOs/employeeform.dto';
export declare class EmployeeController {
    private readonly appService;
    constructor(appService: EmployeeService);
    getHello(): string;
    createUser(createUser: EmployeeForm): EmployeeForm;
    getName(): string;
    findOne(xd: string): string;
    uploadFile(file: Express.Multer.File): string;
    getImages(name: any, res: any): void;
}
