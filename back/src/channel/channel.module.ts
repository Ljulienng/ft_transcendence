import { forwardRef, Module } from '@nestjs/common';
import { ChannelController } from './controller/channel.controller';
import { ChannelService } from './service/channel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './models/channel.entity'
import { MessageModule } from 'src/message/message.module';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/models/user.entity';
import { Message } from 'src/message/models/message.entity';
import { ChannelMemberModule } from 'src/channelMember/channelMember.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    TypeOrmModule.forFeature([Message]), 
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
