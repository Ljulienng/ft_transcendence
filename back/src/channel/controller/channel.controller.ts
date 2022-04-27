import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res } from '@nestjs/common';
import { ChannelService } from '../service/channel.service';
import { CreateChannelDto } from '../models/createChannel.dto';
import { MessageDto } from 'src/message/models/message.dto';
import { Response } from 'express'

@Controller('channel')
export class ChannelController {
    constructor(private readonly channelService: ChannelService) {}

    @Get()
    findAll() {
        return this.channelService.findAll();
    }

    @Get(':id')
    findChannelById(@Param('id') id: string) {
        return this.channelService.findChannelById(id);
    }

    // @Get(':id/message')
    // findMessagesByChannelId(@Param('id') channelId: string): Promise<MessageDto[]> {
    //     return this.channelService.findMessagesByChannelId(channelId);
    // }

    @Post()
    createChannel(
        @Body() channelDto: CreateChannelDto,
        @Res() response: Response) {
        return this.channelService.createChannel(channelDto, response.locals.id);
    }

    @Delete(':id')
    deleteChannel(@Param('id') id: string) {
        return this.channelService.deleteChannel(id);
    }
}
