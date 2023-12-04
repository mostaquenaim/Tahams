import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './Admin/Modules/adminModule.module';
import { CustomerModule } from './Customer/Modules/customerModule.module';
import { GlobalModule } from './Global/Modules/global.module';
import { EmployeeModule } from './Employee/Modules/employeeModule.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    AdminModule,
    CustomerModule,
    GlobalModule,
    EmployeeModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'monorail.proxy.rlwy.net', //localhost
      port: 45372, //5432
      username: 'postgres',
      password: 'AAG-Dcg5GE3g5dCE5D6e6Ga2bdBfD34g', //root
      database: 'railway', //tahams
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
