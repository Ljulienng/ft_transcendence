import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FortyTwoService } from './auth/fortytwo.service';
import { FortyTwoStrategy } from './auth/strategy/fortytwo.strategy';
import { UserService } from './user/service/user.service';
import { UserModule } from './user/user.module';
import { ChannelModule } from './channel/channel.module';
import { MessageModule } from './message/message.module';

// import { ServeStaticModule } from '@nestjs/serve-static'; // for VueJs
// import { join } from 'path'; // for VueJs

@Module({
  imports: [
    // ServeStaticModule.forRoot({ // for VueJs
    //   rootPath: join(__dirname, '..', 'front/dist'), // for VueJs
    // }), // for VueJs
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot({ // for PostGres
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true
    }),
    UserModule,
    AuthModule,
    MessageModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
