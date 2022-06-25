import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FortyTwoService } from './auth/fortytwo.service';
import { FortyTwoStrategy } from './auth/strategy/fortytwo.strategy';
import { UserModule } from './user/user.module';
import { MessageModule } from './message/message.module';
import { PongModule } from './pong/pong.module';
import { ChannelMemberModule } from './channelMember/channelMember.module';
import { MessageUserModule } from './messageUser/messageUser.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({ // for PostGres
      type: 'postgres',
      url: process.env.DATABASE_URL,
      // url: "postgres://user:password@localhost:5432/db",
      autoLoadEntities: true,
      synchronize: true // false for production, with true typeOrm creates tables every time we run the app
    }),
    MessageUserModule,
    UserModule,
    AuthModule,
    MessageModule,
    ChannelMemberModule,
    PongModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule { }
