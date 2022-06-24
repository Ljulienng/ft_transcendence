import { Controller, Delete, Get, Param } from '@nestjs/common';
import { MessageService } from '../service/message.service';

@Controller('message') 
export class MessageController {
    constructor(
        private readonly messageService: MessageService
    ) {}

    @Get()
    findAll() {
        return this.messageService.findAll();
    }

    @Get(':messageId')
    findMessageById(@Param('messageId') messageId: number) {
        return this.messageService.findMessageById(messageId);
    }

    @Delete(':messageId')
    deleteMessage(@Param('messageId') messageId: number) {
        return this.messageService.deleteMessage(messageId);
    }

}
