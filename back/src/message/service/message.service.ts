import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from '../models/message.dto';
import { Message } from '../models/message.entity';
import { Channel } from 'src/channel/models/channel.entity';
import { UserService } from 'src/user/service/user.service';
import { ChannelService } from 'src/channel/service/channel.service';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        private userService: UserService,
        private channelService: ChannelService,
    ) {}

   async findAll(): Promise<Message[]> {
       return await this.messageRepository.find();
   }

  async findMessageById(messageId: string): Promise<Message> {
      return await this.messageRepository.findOneOrFail({
          where: { id: Number(messageId) }
      });
  }

 async delete(messageId: string) {
     const message = await this.findMessageById(messageId);  
     if (!message) {
         throw new NotFoundException();
     }
     return await this.messageRepository.remove(message);
 }
}
