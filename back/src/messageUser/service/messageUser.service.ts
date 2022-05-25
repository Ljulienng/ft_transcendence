import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageUserDto } from '../models/messageUser.dto';
import { MessageUser } from '../models/messageUser.entity';
import { Channel } from 'src/channel/models/channel.entity';
import { User } from 'src/user/models/user.entity';

@Injectable()
export class MessageUserService {
    constructor(
        @InjectRepository(MessageUser)
        private messageUserRepository: Repository<MessageUser>,
    ) {}

   async findAll(): Promise<MessageUser[]> {
       return await this.messageUserRepository.find();
   }

  async findMessageById(messageId: number): Promise<MessageUser> {
      return await this.messageUserRepository.findOneOrFail({
          where: {
              id: messageId
            },
      });
  }

  async findMessagesByReceiver(receiver: User): Promise<MessageUser[]> {
    return await this.messageUserRepository.find({
        where: {
            receiver: receiver
        },
    });
}

  async saveMessage(sender: User, receiver: User, message: CreateMessageUserDto) {
    const newMessage = this.messageUserRepository.create({
        sender: sender,
        receiver: receiver,
        content: message.content,
    });  
    return await this.messageUserRepository.save(newMessage);
  }

 async deleteMessage(messageId: number) {
     const message = await this.findMessageById(messageId);  
     if (!message) {
         throw new NotFoundException();
     }
     return await this.messageUserRepository.remove(message);
 }

 async getMessages(sender: User, receiver: User) {
    console.log("userMessage ");
     const messages = await this.messageUserRepository
     .createQueryBuilder("messageUser")
     .where("messageUser.sender = :sender AND messageUser.receiver = :receiver", {sender: sender, receiver: receiver})
     .andWhere("messageUser.sender = :receiver AND messageUser.receiver = :sender", {sender: sender, receiver: receiver})
     .getMany();

     console.log("userMessage = ", messages);

     return messages
 }
 
}
