import { Repository } from 'typeorm';
import { CreateMessageDto } from '../models/message.dto';
import { Message } from '../models/message.entity';
import { Channel } from 'src/channel/models/channel.entity';
import { User } from 'src/user/models/user.entity';
export declare class MessageService {
    private messageRepository;
    constructor(messageRepository: Repository<Message>);
    findAll(): Promise<Message[]>;
    findMessageById(messageId: number): Promise<Message>;
    findMessagesByChannel(channel: Channel): Promise<Message[]>;
    save(user: User, channel: Channel, message: CreateMessageDto): Promise<Message>;
    deleteMessage(messageId: number): Promise<Message>;
}
