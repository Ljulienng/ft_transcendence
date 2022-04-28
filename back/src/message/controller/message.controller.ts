import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { MessageService } from '../service/message.service';
import { CreateMessageDto } from '../models/createMessage.dto';

@Controller('message') 
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Get()
    findAll() {
        return ;
    }

    @Get(':id')
    findMessageById(@Param('id') id: string) {
        return ;
    }

    @Post()
    createMessage(@Body() createMessage: CreateMessageDto) {
        return ;
    }

    @Delete(':id')
    deleteMessage(@Param('id') id: string) {
        return ;
    }

}
