import { MessageService } from '../service/message.service';
import { MessageDto } from '../models/message.dto';
export declare class MessageController {
    private readonly messageService;
    constructor(messageService: MessageService);
    findAll(): void;
    findMessageById(id: string): void;
    createMessage(messageDto: MessageDto): void;
    deleteMessage(id: string): void;
}
