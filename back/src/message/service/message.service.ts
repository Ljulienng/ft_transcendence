import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from '../models/message.dto';
import { MessageChannel } from '../models/messageChannel.entity';
import { Channel } from 'src/channel/models/channel.entity';
import { User } from 'src/user/models/user.entity';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(MessageChannel)
        private messageChannelRepository: Repository<MessageChannel>, 
    ) {}

   async findAll(): Promise<MessageChannel[]> {
       return await this.messageChannelRepository.find();
   }

  async findMessageById(messageId: number): Promise<MessageChannel> {
      return await this.messageChannelRepository.findOneOrFail({
          where: {
              id: messageId
            },
      });
  }

  async findMessagesByChannel(channel: Channel): Promise<MessageChannel[]> {
    return await this.messageChannelRepository.find({
        where: {
            channel: channel
        },
    });
}

  async saveMessage(user: User, channel: Channel, message: CreateMessageDto) {
    const newMessage = this.messageChannelRepository.create({
        user: user,
        content: message.content,
        channel: channel,
    });  
    return await this.messageChannelRepository.save(newMessage);
  }

 async deleteMessage(messageId: number) {
     const message = await this.findMessageById(messageId);  
     if (!message) {
         throw new NotFoundException();
     }
     return await this.messageChannelRepository.remove(message);
 }

}
