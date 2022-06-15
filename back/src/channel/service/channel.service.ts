import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel} from '../models/channel.entity'
import { changePasswordDto, channelInvitationDto, CreateChannelDto, updateChannelDto, updateMemberDto } from '../models/channel.dto';
import { MessageService } from 'src/message/service/message.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/models/user.entity';
import { JoinChannelDto } from '../models/channel.dto';
import { ChannelMemberService } from 'src/channelMember/service/channelMember.service';
import { UpdateMemberChannelDto } from 'src/channelMember/models/channelMember.dto';
import { CreateMessageDto } from 'src/message/models/message.dto';
import { ChannelMember } from 'src/channelMember/models/channelMember.entity';

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
            where: {
                id: channelId
            },
        });
   }

    /* get channel by its name */
   async findChannelByName(channelName: string): Promise<Channel> {
        return await this.channelRepository.findOne({
            where : {
                name: channelName
            },
        });
    }

    /* get channel members */
    async findMembers(channelId: number): Promise<ChannelMember[]> {
        const channel = await this.findChannelById(channelId);
        return await this.channelMemberService.findMembers(channel);
    }

    /* get the channel owner */
    async   findOwner(channelId: number): Promise<ChannelMember> {
        const channel = await this.findChannelById(channelId);
        return await this.channelMemberService.findOwner(channel);
    }

    /* get channel admins */
    async   findAdmins(channelId: number): Promise<ChannelMember[]> {
        const channel = await this.findChannelById(channelId);
        return await this.channelMemberService.findAdmins(channel);
    }

    async   findMutedAndBanned(channelId: number): Promise<ChannelMember[]> {
        const channel = await this.findChannelById(channelId);
        return await this.channelMemberService.findMutedAndBanned(channel);
    }
    
    /* get channels where user = owner */
    async   findChannelsWhereUserIsOwner(user: User) {
        return await this.channelRepository.find({
            where: {
                owner: user,
            },
        });
    }

    /* create channel */
   async createChannel(createChannel: CreateChannelDto, userId: number) {
        const regex = /^[a-zA-Z0-9_]+$/
        const user = await this.userRepository.findOne({id: userId});

        if (regex.test(createChannel.name) === false) {
            throw new HttpException('Wrong format for chat name only underscore are allowed.', HttpStatus.FORBIDDEN);    
        }
        if (!createChannel.name || createChannel.name.length < 4 || createChannel.name.length > 20) {
            throw new HttpException('chat name beetween 4 and 20 characters please', HttpStatus.FORBIDDEN); 
        }
        if (!user) {
            throw new HttpException('user does not exist', HttpStatus.FORBIDDEN);
        }

        const isSameChatName = await this.channelRepository.findOne({name: createChannel.name});
        if (isSameChatName) {
            throw new HttpException('this name is already used', HttpStatus.FORBIDDEN);
        }
        
        const newChannel = this.channelRepository.create({
            name: createChannel.name,
            type: createChannel.type,
            password: createChannel.password,
            messages: [],
            channelMembers: [],
            owner: user,
       });
 
       if (newChannel.type === "protected") {
           if (!newChannel.password) {
                throw new BadRequestException('need a password for protected channel');
           }
           if (newChannel.password.length < 8 || newChannel.password.length > 20) {
                throw new HttpException('password beetween 8 and 20 characters please', HttpStatus.FORBIDDEN);
           }
            const saltOrRounds = await bcrypt.genSalt();
            newChannel.password = await bcrypt.hash(newChannel.password, saltOrRounds);
       }

       await this.channelRepository.save(newChannel);
       await this.channelMemberService.createMember(user, newChannel, true, true);

       return newChannel.id;
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
            type: "private",
            messages: [],
            channelMembers: [],
            owner: user1,
       }); 

       await this.channelRepository.save(newChannel);
       await this.channelMemberService.createMember(user1, newChannel, true, true);
       await this.channelMemberService.createMember(user2, newChannel, false, true);
    }

    /* check if the password sent is the right one */
   async checkPasswordMatch(sentPassword: string, hashExpectedPassword: string): Promise<boolean> {
    return await bcrypt.compare(sentPassword, hashExpectedPassword);
   }

   /*
   ** the user wants to integrate a channel
   ** need to check if :
   **       - the password is correct (private/protected only)
   **       - the user is not already in the channel
   **       - the user is banned of the channel
   */
   async addUserToChannel(joinChannel: JoinChannelDto, userId: number) {
        const user = await this.userRepository.findOne({id: userId});
        const welcomingChannel = await this.findChannelById(joinChannel.id);

        if (welcomingChannel.type === "protected") {
            if (welcomingChannel.password) {
                const match = await this.checkPasswordMatch(joinChannel.password, welcomingChannel.password);
                if (!match) {
                    throw new UnauthorizedException('incorrect password');
                }
            }
        }

        const channelMember = await this.channelMemberService.findOne(user, welcomingChannel);
        if (channelMember) {
            throw new UnauthorizedException('user already in this channel');
        }

        await this.channelRepository.save(welcomingChannel);
        await this.channelMemberService.createMember(user, welcomingChannel, false, false);    
   }

   /*
   ** the user wants to invite another user in a private channel
   ** need to check if :
   **       - the user is the owner of the channel
   **       - the guest is not already in the channel
   */
   async inviteUserInChannel(user: User, invitation: channelInvitationDto) {
        const channel = await this.findChannelById(invitation.channelId);
        const guest = await this.userRepository.findOne({username: invitation.guest});

        if (channel.owner.id !== user.id) {
            throw new UnauthorizedException('you are not allowed to invite someone to join this channel');
        }
        if (!guest) {
            throw new UnauthorizedException('the guest you want to invite does not exist');
        }
        if (await this.channelMemberService.findOne(guest, channel)) {
            throw new UnauthorizedException('the guest is already in the channel');
        }

        await this.addUserToChannel({
            id: invitation.channelId,
            type: "private",
            password: "" }, guest.id);
        
        return guest;
    }

    /*
   ** the user wants to leave a channel
   ** need to check if :
   **       - the user is a member of this channel
   **       - the user is the channel owner (in this case, remove the channel)
   */
   async deleteChannelMember(leaveChannelId: number, userId: number) {
        const user = await this.userRepository.findOne({id: userId});
        const channelToLeave = await this.findChannelById(leaveChannelId);
        const channelMember = await this.channelMemberService.findOne(user, channelToLeave);

        if (!channelMember) {
            throw new UnauthorizedException('user not in this channel');
        }
        
        // if the owner leave the channel, we delete the channel
        // else we just delete the member
        if (channelMember.owner) {
            await this.channelRepository.remove(channelToLeave);
        } else {
            this.channelMemberService.deleteMember(user, channelToLeave);
            await this.channelRepository.save(channelToLeave);
        }
   }

   /*
   ** the user wants to change the channel password
   ** need to check if :
   **       - the user is a member of this channel
   **       - the user is the channel owner
   **       - the new password is not too short (could increase the constraints...)
   **       - security check : old channel password == old password sent by owner
   */
   async changePassword(/*channelId: number, */userId: number, passwordI: changePasswordDto)
   {
        // console.log('user:', userId, ' changes password of channel:', channelId, ' [new pass:', passwords.newPassword,']');
        const user = await this.userRepository.findOne({id: userId});
        const channel = await this.findChannelById(passwordI.channelId);
        const channelMember = await this.channelMemberService.findOne(user, channel);

        if (!channelMember.owner) {
            throw new HttpException('you are not authorized to change the password', HttpStatus.FORBIDDEN);
        }
        if (!( await this.checkPasswordMatch(passwordI.old, channel.password))) {
            throw new HttpException('old password does not match', HttpStatus.FORBIDDEN);
        }
        if (passwordI.new.length < 8) {
            throw new HttpException('new password too short', HttpStatus.FORBIDDEN);
        }

        const saltOrRounds = await bcrypt.genSalt();
        const password = await bcrypt.hash(passwordI.new, saltOrRounds);
        this.channelRepository.update(channel.id, { password });
   }

   async changeChannelName(owner: User, updates: updateChannelDto) {
    const channel = await this.findChannelById(updates.channelId);
    const member = await this.channelMemberService.findOne(owner, channel);

    if (!member.owner) {
        throw new HttpException('only owner can update the channel', HttpStatus.FORBIDDEN);
    }
    if (!updates.name) {
        throw new HttpException('channel name cannot be null', HttpStatus.FORBIDDEN);
    }
    const isSameChatName = await this.channelRepository.findOne({name: updates.name});
    if (isSameChatName) {
        throw new HttpException('this name is already used', HttpStatus.FORBIDDEN);
    }

    channel.name = updates.name;
    await this.channelRepository.save(channel);
   }

    /* 
    ** the  user wants to remove a channel
    ** need to check if :
    **       - the user is a member of this channel
    **       - the user is the channel owner
    */
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

    async findMember(user: User, channel: Channel) {
        return await this.channelMemberService.findOne(user, channel);
    }

    /*
    ** the  user wants to update element(s) of a channel member (ban, mute)
    */
    async updateMember(owner: User, update: UpdateMemberChannelDto) {
        const userToUpdate = await this.userRepository.findOne({username: update.username});
        const channel = await this.findChannelById(update.channelId);
        return await this.channelMemberService.updateMember(owner, userToUpdate, channel, update);
    }

    async setMemberAsAdmin(owner: User, upgradeMember: updateMemberDto) {
        const userToUpgrade = await this.userRepository.findOne({username: upgradeMember.username});
        const channel = await this.findChannelById(upgradeMember.channelId);
        const updates: UpdateMemberChannelDto = { admin: true };
        return await this.channelMemberService.updateMember(owner, userToUpgrade, channel, updates);
    }

    async unsetMemberAsAdmin(owner: User, downgradeMember: updateMemberDto) {
        const userToDowngrade = await this.userRepository.findOne({username: downgradeMember.username});
        const channel = await this.findChannelById(downgradeMember.channelId);
        const updates: UpdateMemberChannelDto = { admin: false };
        return await this.channelMemberService.updateMember(owner, userToDowngrade, channel, updates);
    }

    /*
    ** get all the messages of a channel
    ** returns most recent last
    */
    async findChannelMessagesByChannelName(user: User, channelName: string) {
        const channel = await this.findChannelByName(channelName);
        const messages = await this.messageService.findMessagesByChannel(user, channel);
        return messages.sort((a, b) => a.createdTime.getTime() - b.createdTime.getTime());
    }

    /*
    ** get all the messages of a channel
    ** returns most recent last
    */
    // async findChannelMessagesByChannelId(channelId: number) {
    //     const channel = await this.findChannelById(channelId);
    //     const messages = await this.messageService.findMessagesByChannel(channel);
    //     return messages.sort((a, b) => a.createdTime.getTime() - b.createdTime.getTime());
    // }

    async saveMessage(userId: number, createMessageDto: CreateMessageDto) {
        const user = await this.userRepository.findOne({id: userId});
        const channel = await this.findChannelById(createMessageDto.channelId);
        const channelMember = await this.channelMemberService.findOne(user, channel);
        if (!channelMember) {
            throw new HttpException('this user is not a channel member', HttpStatus.FORBIDDEN);
        }
        return await this.messageService.saveMessage(user, channel, channelMember, createMessageDto);
      }
    
}
