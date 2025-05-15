/* eslint-disable prettier/prettier */
import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeeController } from "../Controllers/employee.controller"
import { EmployeeEntity } from "../Entities/employee.entity";
import { EmployeeService } from "../Services/employee.service"
import { ConfigModule, ConfigService } from "@nestjs/config";
// import * as dotenv from 'dotenv';
// Load environment variables
// dotenv.config();

@Module({
    imports: [
        ConfigModule,
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: 'smtp.gmail.com',
                    port: 465,
                    ignoreTLS: true,
                    secure: true,
                    auth: {
                        user: configService.get<string>('EMAIL_USER'),
                        pass: configService.get<string>('EMAIL_PASSWORD'),
                    },
                }
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([EmployeeEntity])],
    controllers: [EmployeeController],
    providers: [EmployeeService],
})

export class EmployeeModule { }