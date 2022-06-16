import { forwardRef, Module } from '@nestjs/common';
import { PongService } from './pong.service';
import { PongGateway } from './pong.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './models/match.entity';
import { User } from 'src/user/models/user.entity';
import { UserModule } from 'src/user/user.module';
import { ChatModule } from 'src/chat/chat.module';
import { ChannelModule } from 'src/channel/channel.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ChatModule),
    forwardRef(() => ChannelModule),
    TypeOrmModule.forFeature([Match]),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    PongGateway,
    PongService,
  ],
  exports: [PongGateway, PongService]
})

export class PongModule { }
