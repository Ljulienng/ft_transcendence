import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res } from '@nestjs/common';
import { ChannelService } from '../service/channel.service';
import { CreateChannelDto } from '../models/createChannel.dto';
import { CreateMessageDto } from 'src/message/models/createMessage.dto';
import { Response } from 'express'
import { MessageService } from 'src/message/service/message.service';

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

    @Get(':channelId/postMessage')
    testPostMessage() {
        const message: CreateMessageDto = {
            content: "Hello I'm a message",
        }
        this.messageService.saveMessage(message);
    }

    @Get(':channelId/messages')
    async findMessagesByChannelId(@Param('channelId') channelId: number): Promise<CreateMessageDto[]> {
        console.log("find messages of one channel");
        const channel = await this.channelService.findChannelById(channelId);
        return this.channelService.getChannelMessagesByRoom(channel.name);
    }

    @Post()
    createChannel(
        @Body() channelDto: CreateChannelDto,
        @Res() response: Response) {
        return this.channelService.createChannel(channelDto, response.locals.id);
    }

    @Delete(':channelId')
    deleteChannel(@Param('channelId') channelId: number) {
        return this.channelService.deleteChannel(channelId);
    }
}
