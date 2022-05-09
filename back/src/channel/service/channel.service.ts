import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel, ChannelType} from '../models/channel.entity'
import { CreateChannelDto } from '../models/createChannel.dto';
import { Message } from 'src/message/models/message.entity';
import { MessageService } from 'src/message/service/message.service';
import { UserService } from 'src/user/service/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/models/user.entity';
import { JoinChannelDto } from '../models/joinChannel.dto';

@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>, 
    ) {}

    /* get all channels */
    async findAll(): Promise<Channel[]> {
        return await this.channelRepository.find();
    }

    /* get one channel by its id */
   async findChannelById(channelId: number): Promise<Channel> {
        return await this.channelRepository.findOne({id: channelId});
   }

    /* get one channel by its name */
   async findChannelByName(channelName: string): Promise<Channel> {
        return await this.channelRepository.findOne({name: channelName});
    }

    /* create one channel */
   async createChannel(createChannel: CreateChannelDto, userId: number): Promise<Channel> {
        const user = await this.userRepository.findOne({id: userId});
        
        if (!user) {
            throw new UnauthorizedException('user does not exist');
        }

        const newChannel = this.channelRepository.create({
            name: createChannel.name,
            type: createChannel.type,
            password: createChannel.password,
            messages: [],
            owner: user,
            membersId: [userId],
       });

       if (newChannel.type === ChannelType.protected || newChannel.type === ChannelType.private) {
           if (!newChannel.password) {
               throw new BadRequestException('need a password for private or protected channel');
           }
           else if (newChannel.password.length < 8) {
               throw new HttpException('password too short', HttpStatus.FORBIDDEN);
           }
           else if (newChannel.password.length > 20) {
            throw new HttpException('password too long', HttpStatus.FORBIDDEN);
            }
           else {
               const saltOrRounds = await bcrypt.genSalt();
               newChannel.password = await bcrypt.hash(newChannel.password, saltOrRounds);
           }
       }
       console.log('new channel created : ', newChannel);
       return await this.channelRepository.save(newChannel);
   }

    /* check if the password sent is the right one */
   async checkPasswordMatch(sentPassword: string, expectedPassword: string) {
        return await bcrypt.compare(sentPassword, expectedPassword);
   }

   /*
   ** a user wants to integrate a channel
   ** need to check if :
   **       - the password is correct (private/protected only)
   **       - the user is not already in the channel
   **       - the user is banned of the channel
   */
   async addUserToChannel(joinChannel: JoinChannelDto, userId: number) {
        // const user = await this.userService.findByUserId(userId);
        const user = await this.userRepository.findOne({id: userId});
        
        // select * from channel where channel.id=channelSent.id
        // const welcomingChannel = await this.findChannelById(channelSent.id);
        const welcomingChannel = await this.channelRepository
            .createQueryBuilder('channel')
            .where('channel.id = :channelId', {channelId: joinChannel.id})
            .getOne();
        
        if (welcomingChannel.type !== ChannelType.public) {
            if (welcomingChannel.password) {
                const match = this.checkPasswordMatch(welcomingChannel.password, joinChannel.password);
                if (!match) {
                    throw new UnauthorizedException('incorrect password');
                }
            }
        }

        if (welcomingChannel.membersId.find(userId => userId === user.id)) {
        // if (welcomingChannel.users.find((u) => u.id === user.id)) {
            throw new UnauthorizedException('user already in this channel');
        }

        welcomingChannel.membersId.push(user.id);               // add the user to the channel
        // welcomingChannel.users.push(user);                   // add the user to the channel
        await this.channelRepository.save(welcomingChannel);    // update the channel
   }

   async removeUserToChannel(channelSent: Channel, userId: number) {
        const user = await this.userRepository.findOne({id: userId});
        
        // const channelToLeave = await this.findChannelById(channelSent.id);
        const channelToLeave = await this.channelRepository
            .createQueryBuilder('channel')
            .where('channel.id = :channelId', {channelId: channelSent.id})
            .getOne();
        
        
            // remove the user to the channel

        await this.channelRepository.save(channelToLeave);   // update the channel
   }

   /* only owner/can change the password */
   async changePassword(channelId: number, userId: number, newPassword: string)
   {
        console.log('user:', userId, ' changes password of channel:', channelId, ' [new pass:', newPassword,']');
        if (newPassword.length < 8) {
            throw new HttpException('password too short', HttpStatus.FORBIDDEN);
        }
        else if (newPassword.length > 20) {
         throw new HttpException('password too long', HttpStatus.FORBIDDEN);
         }
   }

    /* remove one channel */
    async deleteChannel(channelId: number) {
        const channel = await this.findChannelById(channelId);
        if (!channel) {
            throw new NotFoundException();
        }
        return this.channelRepository.remove(channel);
    }

    /* get all the messages of a channel */
    async getChannelMessagesByRoom(room: string) {
        const channel = await this.findChannelByName(room);
        const messages = await this.messageRepository.find({
            where: {
                channel: channel,
            }
        });
        return messages.sort((a, b) => a.createdTime.getTime() - b.createdTime.getTime());
    }

    /* get all the messages of a channel */
    async getChannelMessagesByRoomId(roomId: number) {
        const channel = await this.findChannelById(roomId);
        const messages = await this.messageRepository.find({
            where: {
                channel: channel,
            }
        });
        return messages.sort((a, b) => a.createdTime.getTime() - b.createdTime.getTime());
    }

    async saveMessage(/*createMessageDto: CreateMessageDto*/message: string, channelId: number) {
        // const newMessage = this.messageRepository.create(/*createMessageDto*/{
        //     content: message,
        // });
        const currentChannel = await this.findChannelById(channelId);
        console.log('[saveMessage] channel ', channelId, ' : ', currentChannel);
        return await this.messageRepository.save({
            content: message,
            channel: currentChannel,
        });
      }
    
}
