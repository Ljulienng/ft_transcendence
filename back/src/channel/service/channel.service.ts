import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel, ChannelType} from '../models/channel.entity'
import { CreateChannelDto, UpdateChannelDto } from '../models/channel.dto';
import { MessageService } from 'src/message/service/message.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/models/user.entity';
import { JoinChannelDto } from '../models/channel.dto';
import { PasswordI } from '../models/password.interface';
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

    /* get channel by its id */
   async findChannelById(channelId: number): Promise<Channel> {
        return await this.channelRepository.findOne({
            id: channelId
        });
   }

    /* get channel by its name */
   async findChannelByName(channelName: string): Promise<Channel> {
        return await this.channelRepository.findOne({
            name: channelName
        });
    }

    async findMembers(channelId: number) {
        const channel = await this.findChannelById(channelId);
        return await this.channelMemberService.findMembers(channel);
    }

    async   findOwner(channelId: number) {
        const channel = await this.findChannelById(channelId);
        return await this.channelMemberService.findOwner(channel);
    }

    async   findAdmins(channelId: number) {
        const channel = await this.findChannelById(channelId);
        return await this.channelMemberService.findAdmins(channel);
    }

    /* create channel */
   async createChannel(createChannel: CreateChannelDto, userId: number) {
        const user = await this.userRepository.findOne({id: userId});
        if (!user) {
            throw new UnauthorizedException('user does not exist');
        }

        // if (this.channelRepository.findOne({name: createChannel.name})) {
        //     console.log("went there in find one")
        //     throw new UnauthorizedException('this name is already used');  
        // }
        const isSameChatName = await this.channelRepository.findOne({name: createChannel.name});
        if (isSameChatName) {
            throw new UnauthorizedException('this name is already used');  
        }

        
        const newChannel = this.channelRepository.create({
            name: createChannel.name,
            type: createChannel.type,
            password: createChannel.password,
            messages: [],
            channelMembers: [],
            user: user,
       });
 
       if (newChannel.type === ChannelType.protected || newChannel.type === ChannelType.private) {
           if (!newChannel.password) {
                throw new BadRequestException('need a password for private or protected channel');
           }
           if (newChannel.password.length < 8) {
                throw new HttpException('password too short', HttpStatus.FORBIDDEN);
           }
            const saltOrRounds = await bcrypt.genSalt();
            newChannel.password = await bcrypt.hash(newChannel.password, saltOrRounds);
       }
       console.log('new channel created : ', newChannel);
       await this.channelRepository.save(newChannel);
       await this.channelMemberService.createMember(user, newChannel, true, true);
    }

    /*
    ** create DM channel
    ** user1 creates the channel
    */
    async createDmChannel(createChannel: CreateChannelDto, user1Id: number, user2Id: number) {
        const user1 = await this.userRepository.findOne({id: user1Id});
        const user2 = await this.userRepository.findOne({id: user2Id});
        
        if (!user1 || !user2) {
            throw new UnauthorizedException('user does not exist');
        }

        const isSameChatName = await this.channelRepository.findOne({name: createChannel.name});
        if (isSameChatName) {
            throw new UnauthorizedException('this name is already used');  
        }

        const newChannel = this.channelRepository.create({
            name: createChannel.name,
            type: ChannelType.private,
            messages: [],
            channelMembers: [],
            user: user1,
       });
       console.log('new DM channel created : ', newChannel);
       await this.channelRepository.save(newChannel);
       await this.channelMemberService.createMember(user1, newChannel, true, true);
       await this.channelMemberService.createMember(user2, newChannel, false, true);
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
        const welcomingChannel = await this.findChannelById(joinChannel.id);
        
        if (welcomingChannel.type !== ChannelType.public) {
            if (welcomingChannel.password) {
                const match = this.checkPasswordMatch(welcomingChannel.password, joinChannel.password);
                if (!match) {
                    throw new UnauthorizedException('incorrect password');
                }
            }
        }

        const channelMember = await this.channelMemberService.findOne(user, welcomingChannel);

        if (channelMember) {
            throw new UnauthorizedException('user already in this channel');
        }

        await this.channelMemberService.createMember(user, welcomingChannel, false, false);    
        await this.channelRepository.save(welcomingChannel);
   }

   async removeUserToChannel(leaveChannel: Channel, userId: number) {
        const user = await this.userRepository.findOne({id: userId});
        const channelToLeave = await this.findChannelById(leaveChannel.id);
        const channelMember = await this.channelMemberService.findOne(user, channelToLeave);

        if (!channelMember) {
            throw new UnauthorizedException('user not in this channel');

        }
        
        // if the owner leave the channel, we delete the channel
        // else we just delete the member
        if (channelMember.owner) {
            await this.channelRepository.delete(channelToLeave);
        } else {
            this.channelMemberService.deleteMember(user, channelToLeave);
            await this.channelRepository.save(channelToLeave);
        }
   }

   /* only owner can change the password */
   async changePassword(channelId: number, userId: number, passwords: PasswordI)
   {
        // console.log('user:', userId, ' changes password of channel:', channelId, ' [new pass:', passwords.newPassword,']');
        const user = await this.userRepository.findOne({id: userId});
        const channel = await this.findChannelById(channelId);
        const channelMember = await this.channelMemberService.findOne(user, channel);

        if (!channelMember.owner) {
            throw new HttpException('you are not authorized to change the password', HttpStatus.FORBIDDEN);
        }
        if (passwords.newPassword.length < 8) {
            throw new HttpException('password too short', HttpStatus.FORBIDDEN);
        }
        if (!( await this.checkPasswordMatch(passwords.oldPassword, channel.password))) {
            throw new HttpException('current password does not match', HttpStatus.FORBIDDEN);
        }
        const saltOrRounds = await bcrypt.genSalt();
        const password = await bcrypt.hash(passwords.newPassword, saltOrRounds);
        this.channelRepository.update(channel.id, { password });
   }

    /* remove channel */
    async deleteChannel(userId: number, channelId: number) {
        const user = await this.userRepository.findOne({id: userId});
        const channel = await this.findChannelById(channelId);
        const channelMember = await this.channelMemberService.findOne(user, channel);

        if (!channel) {
            throw new NotFoundException();
        }
        if (!channelMember.owner) {
            throw new HttpException('only the owner can delete channels', HttpStatus.FORBIDDEN);
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
    async findChannelMessagesByChannelName(channelName: string) {
        const channel = await this.findChannelByName(channelName);
        const messages = await this.messageService.findMessagesByChannel(channel);
        return messages.sort((a, b) => a.createdTime.getTime() - b.createdTime.getTime());
    }

    /*
    ** get all the messages of a channel
    ** returns most recent last
    */
    async findChannelMessagesByChannelId(channelId: number) {
        const channel = await this.findChannelById(channelId);
        const messages = await this.messageService.findMessagesByChannel(channel);
        return messages.sort((a, b) => a.createdTime.getTime() - b.createdTime.getTime());
    }

    async saveMessage(userId: number, createMessageDto: CreateMessageDto) {
        const user = await this.userRepository.findOne({id: userId});
        const channel = await this.findChannelById(createMessageDto.channelId);
        const channelMember = await this.channelMemberService.findOne(user, channel);
        // if (!channelMember) {
        //     throw new HttpException('this user is not a channel member', HttpStatus.FORBIDDEN);
        // }
        return await this.messageService.saveMessage(user, channel, createMessageDto);
      }
    
}
