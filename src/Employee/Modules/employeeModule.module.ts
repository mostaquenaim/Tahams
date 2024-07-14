/* eslint-disable prettier/prettier */
import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeeController } from "../Controllers/employee.controller"
import { EmployeeEntity } from "../Entities/employee.entity";
import { EmployeeService } from "../Services/employee.service"
import * as dotenv from 'dotenv';
// Load environment variables
dotenv.config();

@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                host: 'smtp.gmail.com',
                port: 465,
                ignoreTLS: true,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                },
            }
        }

        ),
        TypeOrmModule.forFeature([EmployeeEntity])],
    controllers: [EmployeeController],
    providers: [EmployeeService],
})

export class EmployeeModule { }