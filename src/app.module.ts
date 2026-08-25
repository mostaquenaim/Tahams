/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './Admin/Modules/adminModule.module';
import { CustomerModule } from './Customer/Modules/customerModule.module';
import { GlobalModule } from './Global/Modules/global.module';
import { EmployeeModule } from './Employee/Modules/employeeModule.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
// import * as dotenv from 'dotenv';
import { ConfigModule, ConfigService } from '@nestjs/config';
// Load environment variables
// dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Absolute path so env loading doesn't depend on the process's cwd
      // (PM2 can launch the process from a different directory than a
      // manual `node dist/src/main.js`, silently dropping every var).
      envFilePath: join(__dirname, '..', '..', '.env'),
    }),
    AdminModule,
    CustomerModule,
    GlobalModule,
    EmployeeModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
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
