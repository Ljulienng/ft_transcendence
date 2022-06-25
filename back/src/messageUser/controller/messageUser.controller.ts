import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MessageUserService } from '../service/messageUser.service';
import { CreateMessageUserDto } from '../models/messageUser.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TwoFAAuth } from 'src/auth/guards/twoFA.guard';

@Controller('messageUser') 
export class MessageUserController {
    constructor(
        private readonly messageUserService: MessageUserService
    ) {}

    @UseGuards(JwtAuthGuard, TwoFAAuth)
    @Get()
    findAll() {
        return this.messageUserService.findAll();
    }

    @UseGuards(JwtAuthGuard, TwoFAAuth)
    @Get(':messageId')
    findMessageById(@Param('messageId') messageId: number) {
        return this.messageUserService.findMessageById(messageId);
    }

    @UseGuards(JwtAuthGuard, TwoFAAuth)
    @Delete(':messageId')
    deleteMessage(@Param('messageId') messageId: number) {
        return this.messageUserService.deleteMessage(messageId);
    }

}
