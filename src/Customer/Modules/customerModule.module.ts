/* eslint-disable prettier/prettier */
import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomerController } from "../Controllers/customer.controller"
import { UserEntity } from "src/Global/Entities/user.entity";
import { CustomerService } from "../Services/customer.service"
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
        TypeOrmModule.forFeature([UserEntity])],
    controllers: [CustomerController],
    providers: [CustomerService],
})

export class CustomerModule { }