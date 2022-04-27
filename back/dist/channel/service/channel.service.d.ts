import { Repository } from 'typeorm';
import { Channel } from '../models/channel.entity';
import { CreateChannelDto } from '../models/createChannel.dto';
import { MessageService } from 'src/message/service/message.service';
import { UserService } from 'src/user/service/user.service';
export declare class ChannelService {
    private channelRepository;
    private userService;
    private messageService;
    constructor(channelRepository: Repository<Channel>, userService: UserService, messageService: MessageService);
    findAll(): Promise<Channel[]>;
    findChannelById(channelId: string): Promise<Channel>;
    findChannelByName(channelName: string): Promise<Channel>;
    createChannel(createChannel: CreateChannelDto, userId: number): Promise<Channel>;
    checkPasswordMatch(sentPassword: string, expectedPassword: string): Promise<boolean>;
    deleteChannel(channelId: string): Promise<Channel>;
}
