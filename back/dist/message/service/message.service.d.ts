import { Repository } from 'typeorm';
import { Message } from '../models/message.entity';
import { UserService } from 'src/user/service/user.service';
export declare class MessageService {
    private messageRepository;
    private userService;
    constructor(messageRepository: Repository<Message>, userService: UserService);
    findAll(): Promise<Message[]>;
    findMessageById(messageId: string): Promise<Message>;
    saveMessage(message: string, channelId: number): Promise<Message>;
    delete(messageId: string): Promise<Message>;
}
