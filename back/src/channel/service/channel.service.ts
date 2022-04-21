import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel} from '../models/channel.entity'
import { CreateChannelDto } from '../models/createChannel.dto';
import { Message } from 'src/message/models/message.entity';
import { MessageService } from 'src/message/service/message.service';

@Injectable()
export class ChannelService {
    constructor(
        @InjectRepository(Channel)
        private channelRepository: Repository<Channel>,
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
   createChannel(createChannelDto: CreateChannelDto) {
       const channel = this.channelRepository.create(createChannelDto);
       return this.channelRepository.save(channel);
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
