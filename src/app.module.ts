/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './Admin/Modules/adminModule.module';
import { CustomerModule } from './Customer/Modules/customerModule.module';
import { GlobalModule } from './Global/Modules/global.module';
import { EmployeeModule } from './Employee/Modules/employeeModule.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import * as dotenv from 'dotenv';
// Load environment variables
dotenv.config();

@Module({
  imports: [
    AdminModule,
    CustomerModule,
    GlobalModule,
    EmployeeModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST, 
      port: parseInt(process.env.DB_PORT), 
      username: process.env.DB_USERNAME, 
      password: process.env.DB_PASSWORD , 
      database: process.env.DB_NAME, 
      autoLoadEntities: true,
      synchronize: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '../public'), // added ../ to get one folder back
      serveRoot: '/public/', //last slash was important
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
