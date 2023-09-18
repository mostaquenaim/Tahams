import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductEntity } from "../Entities/product.entity";
import { PartnerEntity } from "../Entities/partner.entity";
import { BannerEntity } from "../Entities/banner.entity";
import { CategoryEntity } from "../Entities/category.entity";
import { SizeEntity } from "../Entities/size.entity";
import { SizeAndProductEntity } from "../Entities/sizeAndProduct.entity";


@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                host: 'smtp.gmail.com',
                port: 465,
                ignoreTLS: true,
                secure: true,
                auth: {
                    user: 'mostaquenaimislam@gmail.com',
                    pass: 'vwaxokzhcyjpldl' //missing i
                },
            }
        }

        ),
        TypeOrmModule.forFeature([ProductEntity, PartnerEntity, BannerEntity, CategoryEntity, SizeEntity, SizeAndProductEntity])],
    controllers: [],
    providers: [],
})

export class GlobalModule { }