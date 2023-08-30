import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    session({
      secret: 'my-secret',
      resave: true,
      saveUninitialized: false,
      cookie: {
        maxAge: 30000000 //session time in ms
      }
    }),
  );
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    });

  await app.listen(3000);
}
bootstrap();
