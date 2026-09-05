/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomerController } from "../Controllers/customer.controller"
import { UserEntity } from "src/Global/Entities/user.entity";
import { CustomerService } from "../Services/customer.service"
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([UserEntity])],
    controllers: [CustomerController],
    providers: [CustomerService],
})

export class CustomerModule { }