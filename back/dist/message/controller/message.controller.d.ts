import { MessageService } from '../service/message.service';
export declare class MessageController {
    private readonly messageService;
    constructor(messageService: MessageService);
    findAll(): Promise<import("../models/message.entity").Message[]>;
    findMessageById(messageId: number): Promise<import("../models/message.entity").Message>;
    deleteMessage(messageId: number): Promise<import("../models/message.entity").Message>;
}
