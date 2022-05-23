import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from '../models/message.dto';
import { Message } from '../models/message.entity';
import { Channel } from 'src/channel/models/channel.entity';
import { User } from 'src/user/models/user.entity';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
    ) {}

   async findAll(): Promise<Message[]> {
       return await this.messageRepository.find();
   }

  async findMessageById(messageId: number): Promise<Message> {
      return await this.messageRepository.findOneOrFail({
          where: {
              id: messageId
            },
      });
  }

  async findMessagesByChannel(channel: Channel): Promise<Message[]> {
    return await this.messageRepository.find({
        where: {
            channel: channel
        },
    });
}

  async saveMessage(user: User, channel: Channel, message: CreateMessageDto) {
    const newMessage = this.messageRepository.create({
        user: user,
        content: message.content,
        channel: channel,
    });  
    return await this.messageRepository.save(newMessage);
  }

 async deleteMessage(messageId: number) {
     const message = await this.findMessageById(messageId);  
     if (!message) {
         throw new NotFoundException();
     }
     return await this.messageRepository.remove(message);
 }

}
