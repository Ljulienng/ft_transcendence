import { MessageService } from '../service/message.service';
import { CreateMessageDto } from '../models/createMessage.dto';
export declare class MessageController {
    private readonly messageService;
    constructor(messageService: MessageService);
    findAll(): void;
    findMessageById(id: string): void;
    createMessage(createMessage: CreateMessageDto): void;
    deleteMessage(id: string): void;
}
