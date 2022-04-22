import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ChannelModule } from 'src/channel/channel.module';
import { PassportModule } from "@nestjs/passport";
import { MessageModule } from 'src/message/message.module';
import { JwtModule } from "@nestjs/jwt"
import { FriendRequest } from './models/friend-request.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([FriendRequest]),
    forwardRef(() => AuthModule),
    forwardRef(() => ChannelModule),
    forwardRef(() => MessageModule),
    // TypeOrmModule.forFeature([UserRepository]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]

})
export class UserModule {}
