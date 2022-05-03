import { MessageService } from '../service/message.service';
import { CreateMessageDto } from '../models/createMessage.dto';
export declare class MessageController {
    private readonly messageService;
    constructor(messageService: MessageService);
    findAll(): Promise<import("../models/message.entity").Message[]>;
    findMessageById(id: string): void;
    createMessage(createMessage: CreateMessageDto): Promise<import("../models/message.entity").Message>;
    deleteMessage(id: string): void;
}
