import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { MessageService } from '../service/message.service';
import { CreateMessageDto } from '../models/message.dto';

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

    // @Post()
    // createMessage(@Body() createMessage: CreateMessageDto) {
    //     return this.messageService.saveMessage(createMessage);
    // }

    @Delete(':messageId')
    deleteMessage(@Param('messageId') messageId: number) {
        return this.messageService.deleteMessage(messageId);
    }

}
