import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ChannelService } from '../service/channel.service';
import { CreateChannelDto } from '../models/createChannel.dto';
import { CreateMessageDto } from 'src/message/models/createMessage.dto';
import { Response } from 'express'
import { MessageService } from 'src/message/service/message.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/user/models/user.entity';

@Controller('channel')
export class ChannelController {
    constructor(
        private readonly channelService: ChannelService,
        private messageService: MessageService) {}

    @Get()
    findAll() {
        console.log("return all channels");
        return this.channelService.findAll();
    }


    @Get(':channelId')
    findChannelById(@Param('channelId') channelId: number) {
        console.log("return channel with id=", channelId);
        return this.channelService.findChannelById(channelId);
    }

    @Get(':name')
    findChannelByName(@Param('name') name: string) {
        console.log("return channel with name=", name);
        return this.channelService.findChannelByName(name);
    }

    @Get(':channelId/messages')
    async findMessagesByChannelId(@Param('channelId') channelId: number): Promise<CreateMessageDto[]> {
        console.log("find messages of one channel");
        const channel = await this.channelService.findChannelById(channelId);
        return this.channelService.getChannelMessagesByRoomId(channel.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    createChannel(
        @Req() request,
        @Body() channelDto: CreateChannelDto) {
        // console.log('POST a new channel : ', channelDto);
        return this.channelService.createChannel(channelDto, request.user.id);
    }

    @Delete(':channelId')
    deleteChannel(@Param('channelId') channelId: number) {
        return this.channelService.deleteChannel(channelId);
    }
}
