import { Repository } from 'typeorm';
import { Channel } from '../models/channel.entity';
import { CreateChannelDto } from '../models/createChannel.dto';
import { MessageService } from 'src/message/service/message.service';
export declare class ChannelService {
    private channelRepository;
    private messageService;
    constructor(channelRepository: Repository<Channel>, messageService: MessageService);
    findAll(): Promise<Channel[]>;
    findChannelById(channelId: string): Promise<Channel>;
    findChannelByName(channelName: string): Promise<Channel>;
    createChannel(createChannelDto: CreateChannelDto): Promise<Channel>;
    deleteChannel(channelId: string): Promise<Channel>;
}
