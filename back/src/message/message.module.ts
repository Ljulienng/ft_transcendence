import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './controller/message.controller';
import { MessageChannel } from './models/messageChannel.entity';
import { MessageService } from './service/message.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageChannel]),
],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService], 
})
export class MessageModule {}
