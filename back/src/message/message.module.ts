import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './controller/message.controller';
import { Message } from './models/message.entity';
import { MessageService } from './service/message.service';
import { UserModule } from 'src/user/user.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService], 
})
export class MessageModule {}
