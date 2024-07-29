/* eslint-disable prettier/prettier */
import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomerController } from "../Controllers/customer.controller"
import { UserEntity } from "src/Global/Entities/user.entity";
import { CustomerService } from "../Services/customer.service"
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
        TypeOrmModule.forFeature([UserEntity])],
    controllers: [CustomerController],
    providers: [CustomerService],
})

export class CustomerModule { }