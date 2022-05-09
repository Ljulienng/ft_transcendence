import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ChannelService } from '../service/channel.service';
import { CreateChannelDto } from '../models/createChannel.dto';
import { CreateMessageDto } from 'src/message/models/createMessage.dto';
import { Response } from 'express'
import { MessageService } from 'src/message/service/message.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/user/models/user.entity';
import { PasswordI } from '../models/password.interface';

@Controller('channel')
export class ChannelController {
    constructor(
        private readonly channelService: ChannelService,
        private messageService: MessageService) {}

    @Get()
    findAll() {
        return this.channelService.findAll();
    }


    @Get(':channelId')
    findChannelById(@Param('channelId') channelId: number) {
        return this.channelService.findChannelById(channelId);
    }

    @Get(':name')
    findChannelByName(@Param('name') name: string) {
        return this.channelService.findChannelByName(name);
    }

    @Get(':channelId/messages')
    async findMessagesByChannelId(@Param('channelId') channelId: number): Promise<CreateMessageDto[]> {
        const channel = await this.channelService.findChannelById(channelId);
        return this.channelService.getChannelMessagesByRoomId(channel.id);
    }

    @UseGuards(JwtAuthGuard) // the user need to be connected to add a channel
    @Post()
    createChannel(
        @Req() request,
        @Body() channelDto: CreateChannelDto) {
        // console.log('POST a new channel : ', channelDto);
        return this.channelService.createChannel(channelDto, request.user.id);
    }

    // test : curl -X POST -d '{"oldPassword":"oldpass", "newPassword":"newpass"}' -H "Content-Type: application/json" http://localhost:3000/channel/{id}/changePass
    // @UseGuards(JwtAuthGuard) // line is commented for tests
    @Post(':channelId/changePass')
    changePassword(
        @Param('channelId') channelId: number,
        @Req() request,
        @Body() passwords: PasswordI        
    ) {
        console.log('changes password of channel:', channelId, ' [old pass:', passwords.oldPassword,']  ', ' [new pass:', passwords.newPassword,']');
        return this.channelService.changePassword(channelId, 1/*request.user.id*/, passwords);
    }

    @Delete(':channelId')
    deleteChannel(@Param('channelId') channelId: number) {
        return this.channelService.deleteChannel(channelId);
    }
}
