import { Repository } from 'typeorm';
import { Message } from '../models/message.entity';
import { Channel } from 'src/channel/models/channel.entity';
import { UserService } from 'src/user/service/user.service';
import { ChannelService } from 'src/channel/service/channel.service';
export declare class MessageService {
    private messageRepository;
    private userService;
    private channelService;
    constructor(messageRepository: Repository<Message>, userService: UserService, channelService: ChannelService);
    findAll(): Promise<Message[]>;
    findMessageById(messageId: string): Promise<Message>;
    saveMessage(message: string, channelId: number): Promise<{
        content: string;
        channel: Channel;
    } & Message>;
    delete(messageId: string): Promise<Message>;
}
