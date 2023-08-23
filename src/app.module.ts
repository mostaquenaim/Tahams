import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './Admin/Modules/adminModule.module';
import { ProductEntity } from './Global/Entities/product.entity';
import { CustomerModule } from './Customer/Modules/customerModule.module';
import { GlobalModule } from './Global/Modules/global.module';



@Module({
  imports: [AdminModule, CustomerModule, GlobalModule, TypeOrmModule.forRoot(
    {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'Tahams',
      autoLoadEntities: true,
      synchronize: true,
    }
  ),
  TypeOrmModule.forFeature([])],
  controllers: [],
  providers: [],
})

export class AppModule { }