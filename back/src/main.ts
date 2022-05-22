import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as passport from 'passport'
import { join } from 'path'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(passport.initialize());
  app.useStaticAssets(join(__dirname, '..', 'static'));
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: true,
  });
  await app.listen(3000);

}
bootstrap();
