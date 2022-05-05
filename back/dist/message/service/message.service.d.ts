import { Repository } from 'typeorm';
import { Message } from '../models/message.entity';
import { UserService } from 'src/user/service/user.service';
import { ChannelService } from 'src/channel/service/channel.service';
export declare class MessageService {
    private messageRepository;
    private userService;
    private channelService;
    constructor(messageRepository: Repository<Message>, userService: UserService, channelService: ChannelService);
    findAll(): Promise<Message[]>;
    findMessageById(messageId: string): Promise<Message>;
    delete(messageId: string): Promise<Message>;
}
