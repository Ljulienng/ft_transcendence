import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel} from '../models/channel.entity'
import { channelInvitationDto, CreateChannelDto, upgradeMemberDto } from '../models/channel.dto';
import { MessageService } from 'src/message/service/message.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/models/user.entity';
import { JoinChannelDto } from '../models/channel.dto';
import { PasswordI } from '../models/password.interface';
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
        console.log("channelid : ", channelId);
        console.log("channel : ", channel);
        return await this.channelMemberService.findOwner(channel);
    }

    /* get channel admins */
    async   findAdmins(channelId: number): Promise<ChannelMember[]> {
        const channel = await this.findChannelById(channelId);
        return await this.channelMemberService.findAdmins(channel);
    }

    /* get channels where user = owner */
    async   findChannelsWhereUserIsOwner(user: User) {
        console.log("find owner");
        return await this.channelRepository.find({
            where: {
                owner: user,
            },
        });
    }

    /* create channel */
   async createChannel(createChannel: CreateChannelDto, userId: number) {
        const user = await this.userRepository.findOne({id: userId});
        if (!user) {
            throw new UnauthorizedException('user does not exist');
        }

        if (!createChannel.name) {
            throw new UnauthorizedException('channel name cannot be null');
        }

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
            owner: user,
       });
 
       if (newChannel.type === "protected") {
           if (!newChannel.password) {
                throw new BadRequestException('need a password for protected channel');
           }
           if (newChannel.password.length < 8) {
                throw new HttpException('password too short', HttpStatus.FORBIDDEN);
           }
            const saltOrRounds = await bcrypt.genSalt();
            newChannel.password = await bcrypt.hash(newChannel.password, saltOrRounds);
       }

       await this.channelRepository.save(newChannel);
       await this.channelMemberService.createMember(user, newChannel, true, true);
       console.log("channel id : ", newChannel.id );
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
   async changePassword(/*channelId: number, */userId: number, passwordI: PasswordI)
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
        console.log("member:", channelMember);
        if (!channelMember.owner) {
            throw new HttpException('only the owner can delete channels', HttpStatus.FORBIDDEN);
        }
        return await this.channelRepository.remove(channel);
    }

    /*
    ** the  user wants to update element(s) of a channel member (ban, mute)
    */
    async updateChannelMember(userId: number, memberId: number, channelId: number, updates: UpdateMemberChannelDto) {
        const userWhoUpdate = await this.userRepository.findOne({id: userId});
        const userToUpdate = await this.userRepository.findOne({id: memberId});
        const channel = await this.findChannelById(channelId);
        return await this.channelMemberService.updateMember(userWhoUpdate, userToUpdate, channel, updates);
    }

    async setMemberAsAdmin(owner: User, upgradeMember: upgradeMemberDto) {
        const userToUpgrade = await this.userRepository.findOne({username: upgradeMember.username});
        const channel = await this.findChannelById(upgradeMember.channelId);
        const updates: UpdateMemberChannelDto = { admin: true };
        return await this.channelMemberService.updateMember(owner, userToUpgrade, channel, updates);
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
        if (!channelMember) {
            throw new HttpException('this user is not a channel member', HttpStatus.FORBIDDEN);
        }
        return await this.messageService.saveMessage(user, channel, createMessageDto);
      }
    
}
