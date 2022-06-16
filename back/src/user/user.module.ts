import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './service/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controller/user.controller';
import { User } from './models/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ChannelModule } from 'src/channel/channel.module';
import { PassportModule } from "@nestjs/passport";
import { MessageUserModule } from 'src/messageUser/messageUser.module';
import { MessageModule } from 'src/message/message.module';
import { JwtModule } from "@nestjs/jwt"
import { MessageUser } from 'src/messageUser/models/messageUser.entity';
import { UserGateway } from './user.gateway';
import { ChannelMemberModule } from 'src/channelMember/channelMember.module';
import { PongModule } from 'src/pong/pong.module';
import { Match } from 'src/pong/models/match.entity';
import { PongService } from 'src/pong/pong.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([MessageUser]),
    TypeOrmModule.forFeature([Match]),
    forwardRef(() => AuthModule),
    forwardRef(() => ChannelModule),
    forwardRef(() => MessageUserModule),
    forwardRef(() => MessageModule),
    forwardRef(() => ChannelMemberModule),
    forwardRef(() => PongModule),
    // TypeOrmModule.forFeature([UserRepository]),
  ],
  controllers: [UserController],
  providers: [PongService, UserService, UserGateway],
  exports: [UserService]

})
export class UserModule { }
