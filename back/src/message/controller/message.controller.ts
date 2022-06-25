import { Controller, Delete, Get, Param, UseGuards} from '@nestjs/common';
import { MessageService } from '../service/message.service';
import { TwoFAAuth } from 'src/auth/guards/twoFA.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('message') 
export class MessageController {
    constructor(
        private readonly messageService: MessageService
    ) {}

    @UseGuards(JwtAuthGuard, TwoFAAuth)
    @Get()
    findAll() {
        return this.messageService.findAll();
    }

    @UseGuards(JwtAuthGuard, TwoFAAuth)
    @Get(':messageId')
    findMessageById(@Param('messageId') messageId: number) {
        return this.messageService.findMessageById(messageId);
    }

    @UseGuards(JwtAuthGuard, TwoFAAuth)
    @Delete(':messageId')
    deleteMessage(@Param('messageId') messageId: number) {
        return this.messageService.deleteMessage(messageId);
    }

}
