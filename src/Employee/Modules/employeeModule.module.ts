/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeeController } from "../Controllers/employee.controller"
import { EmployeeEntity } from "../Entities/employee.entity";
import { EmployeeService } from "../Services/employee.service"
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([EmployeeEntity])],
    controllers: [EmployeeController],
    providers: [EmployeeService],
})

export class EmployeeModule { }