import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel, ChannelType} from '../models/channel.entity'
import { CreateChannelDto } from '../models/createChannel.dto';
import { Message } from 'src/message/models/message.entity';
import { MessageService } from 'src/message/service/message.service';
import { UserService } from 'src/user/service/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/models/user.entity';

@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        // private messageService: MessageService,
    ) {}

    /* get all channels */
    async findAll(): Promise<Channel[]> {
        return await this.channelRepository.find();
    }

    /* get one channel by its id */
   async findChannelById(channelId: number): Promise<Channel> {
        return await this.channelRepository.findOneOrFail({
           where: { id: channelId }
       });
   }

    /* get one channel by its name */
   async findChannelByName(channelName: string): Promise<Channel> {
        return await this.channelRepository.findOneOrFail({
        where: { name: channelName }
        });
    }

    /* create one channel */
   async createChannel(createChannel: CreateChannelDto, userId: number): Promise<Channel> {
        // const user = await this.userService.findByUserId(userId);
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
       });

       if (newChannel.type === ChannelType.protected || newChannel.type === ChannelType.private) {
           if (!newChannel.password) {
               throw new BadRequestException('need a password for private or protected channel');
           }
           else {
               const saltOrRounds = await bcrypt.genSalt();
               newChannel.password = await bcrypt.hash(newChannel.password, saltOrRounds);
           }
       }

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
   async addUserToChannel(channel: Channel, userId: number) {
        // const user = await this.userService.findByUserId(userId);
        const user = await this.userRepository.findOne({id: userId});
        const welcomingChannel = await this.findChannelById(channel.id);
        
        if (welcomingChannel.type !== ChannelType.public) {
            if (welcomingChannel.password) {
                const match = this.checkPasswordMatch(welcomingChannel.password, channel.password);
                if (!match) {
                    throw new UnauthorizedException('incorrect password');
                }
            }
        }

        if (welcomingChannel.users.find((u) => u.id === user.id)) {
            throw new UnauthorizedException('user already in this channel');
        }
   }

   async removeUserToChannel(channel: Channel, userId: number) {
        const user = await this.userRepository.findOne({id: userId});
        const channelToLeave = await this.findChannelById(channel.id);
   }

    /* remove one channel */
    async deleteChannel(channelId: number) {
        const channel = await this.findChannelById(channelId);
        if (!channel) {
            throw new NotFoundException();
        }
        return this.channelRepository.remove(channel);
    }
}
