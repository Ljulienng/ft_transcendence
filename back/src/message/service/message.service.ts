import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from '../models/createMessage.dto';
import { Message } from '../models/message.entity';
import { Channel } from 'src/channel/models/channel.entity';
import { UserService } from 'src/user/service/user.service';
import { ChannelService } from 'src/channel/service/channel.service';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        @Inject(UserService)
        private userService: UserService,
    ) {}

    /* get all messages */
   async findAll(): Promise<Message[]> {
       return await this.messageRepository.find();
   }

   /* get a message by its id */
  async findMessageById(messageId: string): Promise<Message> {
      return await this.messageRepository.findOneOrFail({
          where: { id: Number(messageId) }
      });
  }

  /* save a message */
  async saveMessage(createMessageDto: CreateMessageDto) {
    const newMessage = this.messageRepository.create({
        user: createMessageDto.user,
        content: createMessageDto.content,
   });

   return this.messageRepository.save(newMessage);
  }

  /* remove a message */
 async delete(messageId: string) {
     const message = await this.findMessageById(messageId);
     if (!message) {
         throw new NotFoundException();
     }
     return this.messageRepository.remove(message);
 }

}
