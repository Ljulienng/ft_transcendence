import { forwardRef, Module } from '@nestjs/common';
import { ChannelController } from './controller/channel.controller';
import { ChannelService } from './service/channel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './models/channel.entity'
import { MessageModule } from 'src/message/message.module';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/models/user.entity';
import { MessageChannel } from 'src/message/models/messageChannel.entity';
import { ChannelMemberModule } from 'src/channelMember/channelMember.module';
import { UserService } from 'src/user/service/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    TypeOrmModule.forFeature([MessageChannel]), 
    TypeOrmModule.forFeature([User]),
    forwardRef(() => MessageModule), 
    forwardRef(() => UserModule),
    forwardRef(() => ChannelMemberModule),
  ],
  controllers: [ChannelController], 
  providers: [ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
