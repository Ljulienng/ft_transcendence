import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './controller/message.controller';
import { Message } from './models/message.entity';
import { MessageService } from './service/message.service';
import { UserModule } from 'src/user/user.module';
import { Channel } from 'src/channel/models/channel.entity';
import { ChannelModule } from 'src/channel/channel.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    TypeOrmModule.forFeature([Channel]),
    forwardRef(() => UserModule),
    forwardRef(() => ChannelModule),
],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService], 
})
export class MessageModule {}
