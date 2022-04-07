import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageDto } from '../models/message.dto';
import { Message } from '../models/message.entity';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
    ) {}

    /*
    ** get all messages
    */
   async findAll(): Promise<Message[]> {
       return await this.messageRepository.find();
   }

   /*
   ** get one message by its id
   */
  async findMessageById(messageId: string): Promise<Message> {
      return await this.messageRepository.findOneOrFail({
          where: { id: Number(messageId) }
      });
  }

  /*
  ** create one message
  */
  create(messageDto: MessageDto) {
      const message = this.messageRepository.create(messageDto);
      return this.messageRepository.save(message);
  }

  /*
  ** remove one message
  */
 async delete(messageId: string) {
     const message = await this.findMessageById(messageId);
     if (!message) {
         throw new NotFoundException();
     }
     return this.messageRepository.remove(message);
 }

}
