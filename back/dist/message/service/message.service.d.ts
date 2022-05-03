import { Repository } from 'typeorm';
import { MessageDto } from '../models/message.dto';
import { Message } from '../models/message.entity';
export declare class MessageService {
    private messageRepository;
    constructor(messageRepository: Repository<Message>);
    findAll(): Promise<Message[]>;
    findMessageById(messageId: string): Promise<Message>;
    create(messageDto: MessageDto): Promise<Message>;
    delete(messageId: string): Promise<Message>;
}
