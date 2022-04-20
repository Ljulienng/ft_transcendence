import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as passport from 'passport'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(passport.initialize());
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: true,
  });
  await app.listen(3000);


}
bootstrap();
