import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CreateMessageDto } from '../models/message.dto';
import { MessageChannel } from '../models/messageChannel.entity';
import { Channel } from 'src/channel/models/channel.entity';
import { User } from 'src/user/models/user.entity';
import { ChannelMember } from 'src/channelMember/models/channelMember.entity';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(MessageChannel)
        private messageChannelRepository: Repository<MessageChannel>, 
    ) {}

    /*
    ** don't display messages of banned members during the banned time
    ** so we exclude them from the request to the db
    */
   async findAll(): Promise<MessageChannel[]> {
    return await this.messageChannelRepository.find({
        relations: ['member'],
        where: {
            member: {
                banned: false,
            },
        }, 
    });
   }

  async findMessageById(messageId: number): Promise<MessageChannel> {
    return await this.messageChannelRepository.findOneOrFail({
        relations: ['member'],
        where: {
            id: messageId,
            member: {
                banned: false,
            },
        },    
    });
  }

  /*
  ** exclude messages from banned members (channel scope)
  ** exclude messages from users blocked by the requesting user (global scope)
  */
  async findMessagesByChannel(user: User, channel: Channel): Promise<MessageChannel[]> {
    if (!user.blocked) {
        return await this.messageChannelRepository.find({
            relations: ['member'],
            where: {
                channel: channel,
                member: {
                    banned: false,
                },
            },
        });
    }
    else {
        return await this.messageChannelRepository.find({
            relations: ['member', 'user'],
            where: {
                channel: channel,
                member: {
                    banned: false,
                },
                user: {
                    id: Not(In(user.blocked)),
                },
            },
        });
    }
}

  async saveMessage(user: User, channel: Channel, channelMember: ChannelMember, message: CreateMessageDto) {
    const newMessage = this.messageChannelRepository.create({
        member: channelMember,
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
