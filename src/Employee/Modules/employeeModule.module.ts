/* eslint-disable prettier/prettier */
import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeeController } from "../Controllers/employee.controller"
import { EmployeeEntity } from "../Entities/employee.entity";
import { EmployeeService } from "../Services/employee.service"


@Module({
    imports:[
        MailerModule.forRoot({
            transport: {
              host: 'smtp.gmail.com',
                       port: 465,
                       ignoreTLS: true,
                       secure: true,
                       auth: {
                           user: 'mostaquenaimislam@gmail.com',
                           pass: '' //missing i
                       },
                      }
          }
          
          ),
        TypeOrmModule.forFeature([EmployeeEntity])],
controllers: [EmployeeController],
providers: [EmployeeService],
})

export class EmployeeModule {}