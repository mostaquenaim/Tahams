/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://127.0.0.1:8000',
      'http://localhost:8000',
      'https://tahamsbd.com',
      'https://www.tahamsbd.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  await app.listen(3000);
}
bootstrap();
