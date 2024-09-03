import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as dotenv from 'dotenv';
// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    session({
      secret: 'my-secret',
      resave: true,
      saveUninitialized: false,
      cookie: {
        maxAge: parseInt(process.env.SESSION_MAX_AGE),
      },
    }),
  );
  app.enableCors({
<<<<<<< HEAD
origin: ['http://localhost:8000', 'https://tahamsbd.com'],
=======
    origin: ['http://localhost:8000', 'https://tahamsbd.com'],
>>>>>>> d0440f03335981003367ef580b8a7e723b75ff7d
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();
