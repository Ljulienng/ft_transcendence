import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res } from '@nestjs/common';
import { ChannelService } from '../service/channel.service';
import { CreateChannelDto } from '../models/createChannel.dto';
import { CreateMessageDto } from 'src/message/models/createMessage.dto';
import { Response } from 'express'

@Controller('channel')
export class ChannelController {
    constructor(private readonly channelService: ChannelService) {}

    @Get()
    findAll() {
        console.log("return all channels");
        return this.channelService.findAll();
    }

    @Get(':id')
    findChannelById(@Param('id') id: number) {
        console.log("return channel with id=", id);
        return this.channelService.findChannelById(id);
    }

    @Get(':name')
    findChannelByName(@Param('name') name: string) {
        console.log("return channel with name=", name);
        return this.channelService.findChannelByName(name);
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
    deleteChannel(@Param('id') id: number) {
        return this.channelService.deleteChannel(id);
    }
}
