import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './service/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controller/user.controller';
import { User } from './models/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ChannelModule } from 'src/channel/channel.module';
import { PassportModule } from "@nestjs/passport";
import { MessageModule } from 'src/message/message.module';
import { JwtModule } from "@nestjs/jwt"
import { UserGateway } from './user.gateway';
import { ChannelMemberModule } from 'src/channelMember/channelMember.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    forwardRef(() => ChannelModule),
    forwardRef(() => MessageModule),
    forwardRef(() => ChannelMemberModule),
    // TypeOrmModule.forFeature([UserRepository]),
  ],
  controllers: [UserController],
  providers: [UserService, UserGateway],
  exports: [UserService]

})
export class UserModule {}
