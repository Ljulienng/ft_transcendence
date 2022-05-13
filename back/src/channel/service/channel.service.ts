import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel, ChannelType} from '../models/channel.entity'
import { CreateChannelDto, UpdateChannelDto } from '../models/channel.dto';
import { Message } from 'src/message/models/message.entity';
import { MessageService } from 'src/message/service/message.service';
import { UserService } from 'src/user/service/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/models/user.entity';
import { JoinChannelDto } from '../models/channel.dto';
import { PasswordI } from '../models/password.interface';
import { ChannelMember } from 'src/channelMember/models/channelMember.entity';
import { ChannelMemberService } from 'src/channelMember/service/channelMember.service';
import { UpdateMemberChannelDto } from 'src/channelMember/models/channelMember.dto';
import { CreateMessageDto } from 'src/message/models/message.dto';

@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @Inject(ChannelMemberService)
        private channelMemberService: ChannelMemberService,
        @Inject(MessageService)
        private messageService: MessageService,
    ) {}

    /* 
    ** get all channels
    ** returns most recent first
    */
    async findAll(): Promise<Channel[]> {
        return (await this.channelRepository.find()).sort((a, b)=> b.createdTime.getTime() - a.createdTime.getTime());
    }

    /* get one channel by its id */
   async findChannelById(channelId: number): Promise<Channel> {
        return await this.channelRepository.findOne({
            id: channelId
        });
   }

    /* get one channel by its name */
   async findChannelByName(channelName: string): Promise<Channel> {
        return await this.channelRepository.findOne({
            name: channelName
        });
    }

    /* create one channel */
   async createChannel(createChannel: CreateChannelDto, userId: number)/*: Promise<Channel>*/ {
        const user = await this.userRepository.findOne({id: userId});
        
        if (!user) {
            throw new UnauthorizedException('user does not exist');
        }

        const newChannel = this.channelRepository.create({
            name: createChannel.name,
            type: createChannel.type,
            password: createChannel.password,
            messages: [],
            channelMembers: [],
            owner: user,
       });

       if (newChannel.type === ChannelType.protected || newChannel.type === ChannelType.private) {
           if (!newChannel.password) {
                throw new BadRequestException('need a password for private or protected channel');
           }
           if (newChannel.password.length < 8) {
                throw new HttpException('password too short', HttpStatus.FORBIDDEN);
           }
           if (newChannel.password.length > 20) {
                throw new HttpException('password too long', HttpStatus.FORBIDDEN);
            }
            const saltOrRounds = await bcrypt.genSalt();
            newChannel.password = await bcrypt.hash(newChannel.password, saltOrRounds);
       }
       console.log('new channel created : ', newChannel);
       await this.channelRepository.save(newChannel);
       await this.channelMemberService.createMember(user, newChannel, true);
    }

    /* check if the password sent is the right one */
   async checkPasswordMatch(sentPassword: string, hashExpectedPassword: string): Promise<boolean> {
    return await bcrypt.compare(sentPassword, hashExpectedPassword);
   }

   /*
   ** a user wants to integrate a channel
   ** need to check if :
   **       - the password is correct (private/protected only)
   **       - the user is not already in the channel
   **       - the user is banned of the channel
   */
   async addUserToChannel(joinChannel: JoinChannelDto, userId: number) {
        const user = await this.userRepository.findOne({id: userId});
        
        // select * from channel where channel.id=channelSent.id
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

        if (this.channelMemberService.findOne(user, welcomingChannel)) {
            throw new UnauthorizedException('user already in this channel');
        }

        this.channelMemberService.createMember(user, welcomingChannel, false); // add the user to the channel
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
   async changePassword(channelId: number, userId: number, passwords: PasswordI)
   {
        console.log('user:', userId, ' changes password of channel:', channelId, ' [new pass:', passwords.newPassword,']');
        const channel = await this.findChannelById(channelId);

        if (userId !== channel.owner.id) {
            throw new HttpException('you are not authorized to change the password', HttpStatus.FORBIDDEN);
        }
        if (passwords.newPassword.length < 8) {
            throw new HttpException('password too short', HttpStatus.FORBIDDEN);
        }
        if (passwords.newPassword.length > 20) {
            throw new HttpException('password too long', HttpStatus.FORBIDDEN);
        }
        if (!( await this.checkPasswordMatch(passwords.oldPassword, channel.password))) {
            throw new HttpException('current password does not match', HttpStatus.FORBIDDEN);
        }
        console.log('password changed');
        const saltOrRounds = await bcrypt.genSalt();
        const password = await bcrypt.hash(passwords.newPassword, saltOrRounds);
        this.channelRepository.update(channel.id, { password });
   }

    /* remove one channel */
    async deleteChannel(channelId: number) {
        const channel = await this.findChannelById(channelId);
        if (!channel) {
            throw new NotFoundException();
        }
        return await this.channelRepository.remove(channel);
    }

    async updateChannelMember(userId: number, memberId: number, channelId: number, updates: UpdateMemberChannelDto) {
        const userWhoUpdate = await this.userRepository.findOne({id: userId});
        const userToUpdate = await this.userRepository.findOne({id: memberId});
        const channel = await this.findChannelById(channelId);
        
        return await this.channelMemberService.updateMember(userWhoUpdate, userToUpdate, channel, updates);
    }

    async deleteChannelMember(userId: number, channelId: number) {
        const user = await this.userRepository.findOne({id: userId});
        const channel = await this.findChannelById(channelId);
        return await this.channelMemberService.deleteMember(user, channel);
    }

    /*
    ** get all the messages of a channel
    ** returns most recent last
    */
    async getChannelMessagesByRoomName(room: string) {
        const channel = await this.findChannelByName(room);
        const messages = await this.messageService.findMessagesByChannel(channel);
        return messages.sort((a, b) => a.createdTime.getTime() - b.createdTime.getTime());
    }

    /*
    ** get all the messages of a channel
    ** returns most recent last
    */
    async getChannelMessagesByRoomId(roomId: number) {
        const channel = await this.findChannelById(roomId);
        const messages = await this.messageService.findMessagesByChannel(channel);
        return messages.sort((a, b) => a.createdTime.getTime() - b.createdTime.getTime());
    }

    async saveMessage(userId: number, createMessageDto: CreateMessageDto/*message: string, channelId: number*/) {
        const user = await this.userRepository.findOne({id: userId});
        const currentChannel = await this.findChannelById(createMessageDto.channelId);
        return await this.messageService.save(user, currentChannel, createMessageDto);
      }
    
}
