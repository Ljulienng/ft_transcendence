import { Repository } from 'typeorm';
import { Channel } from '../models/channel.entity';
import { CreateChannelDto } from '../models/createChannel.dto';
import { MessageService } from 'src/message/service/message.service';
import { User } from 'src/user/models/user.entity';
export declare class ChannelService {
    private channelRepository;
    private userRepository;
    private messageService;
    constructor(channelRepository: Repository<Channel>, userRepository: Repository<User>, messageService: MessageService);
    findAll(): Promise<Channel[]>;
    findChannelById(channelId: number): Promise<Channel>;
    findChannelByName(channelName: string): Promise<Channel>;
    createChannel(createChannel: CreateChannelDto, userId: number): Promise<Channel>;
    checkPasswordMatch(sentPassword: string, expectedPassword: string): Promise<boolean>;
    addUserToChannel(channel: Channel, userId: number): Promise<void>;
    deleteChannel(channelId: number): Promise<Channel>;
}
