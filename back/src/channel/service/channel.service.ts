import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel, ChannelType} from '../models/channel.entity'
import { CreateChannelDto } from '../models/createChannel.dto';
import { Message } from 'src/message/models/message.entity';
import { MessageService } from 'src/message/service/message.service';
import { UserService } from 'src/user/service/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
        @Inject(UserService)
        private userService: UserService,
        @Inject(MessageService)
        private messageService: MessageService,
    ) {}

    /*
    ** get all channels
    */
    async findAll(): Promise<Channel[]> {
        return await this.channelRepository.find();
    }

    /*
    ** get one channel by its id
    */
   async findChannelById(channelId: string): Promise<Channel> {
        return await this.channelRepository.findOneOrFail({
           where: { id: Number(channelId) }
       });
   }

    /* 
    ** get one channel by its id
    */
   async findChannelByName(channelName: string): Promise<Channel> {
        return await this.channelRepository.findOneOrFail({
        where: { name: channelName }
        });
    }

    /* 
    ** get messages by channel id
    */ // TEST A MODIFIER - RETOURNE TOUS LES MESSAGES
    // async findMessagesByChannelId(channelId: string): Promise<Message[]> {
    //     return await this.messageService.findAll();
    // }

    /*
    ** create one channel
    */
   async createChannel(createChannel: CreateChannelDto, userId: number) {
        const user = await this.userService.findByUserId(userId);

        if (!user) {
            throw new UnauthorizedException('user doesn\'t exist');
        }

        const newChannel = this.channelRepository.create({
            name: createChannel.name,
            type: createChannel.type,
            password: createChannel.password,
            messages: [],
            // owner: user,
       });

       if (newChannel.type == ChannelType.protected || newChannel.type == ChannelType.private) {
           if (!newChannel.password) {
               throw new BadRequestException('need a password for private or protected channel');
           }
           else {
               newChannel.password = bcrypt.
           }
       }

       return await this.channelRepository.save(newChannel);
   }

    /*
    ** remove one channel
    */
    async deleteChannel(channelId: string) {
        const channel = await this.findChannelById(channelId);
        if (!channel) {
            throw new NotFoundException();
        }
        return this.channelRepository.remove(channel);
    }
}
