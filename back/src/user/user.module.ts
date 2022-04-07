import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { FortyTwoStrategy } from 'src/auth/strategy/fortytwo.strategy';
import { ChannelModule } from 'src/channel/channel.module';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
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
