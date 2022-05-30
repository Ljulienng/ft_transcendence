import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { MessageUserService } from '../service/messageUser.service';
import { CreateMessageUserDto } from '../models/messageUser.dto';

@Controller('messageUser') 
export class MessageUserController {
    constructor(
        private readonly messageUserService: MessageUserService
    ) {}

    @Get()
    findAll() {
        return this.messageUserService.findAll();
    }

    @Get(':messageId')
    findMessageById(@Param('messageId') messageId: number) {
        return this.messageUserService.findMessageById(messageId);
    }

    @Delete(':messageId')
    deleteMessage(@Param('messageId') messageId: number) {
        return this.messageUserService.deleteMessage(messageId);
    }

}
