import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ChannelService } from '../service/channel.service';
import { CreateChannelDto, UpdateChannelDto } from '../models/channel.dto';
import { CreateMessageDto } from 'src/message/models/message.dto';
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

    // test : curl -v  -X POST -d '{"name":"room42", "type": 1,  "password":"supersecuremdp"}' -H "Content-Type: application/json" http://localhost:3000/channel/
    // @UseGuards(JwtAuthGuard) // user has to be connected   // line is commented for tests
    @Post()
    createChannel(
        @Req() request,
        @Body() channelDto: CreateChannelDto) {
        // console.log('POST a new channel : ', channelDto);
        return this.channelService.createChannel(channelDto, 1/*request.user.id*/);
    }

    // test : curl -X POST -d '{"oldPassword":"oldpass", "newPassword":"newpass"}' -H "Content-Type: application/json" http://localhost:3000/channel/{id}/changePass
    // @UseGuards(JwtAuthGuard) // user has to be connected  // line is commented for tests
    @Post(':channelId/changePass')
    changePassword(
        @Param('channelId') channelId: number,
        @Req() request,
        @Body() passwords: PasswordI) {
        return this.channelService.changePassword(channelId, 1/*request.user.id*/, passwords);
    }

    @Patch(':channelId/:userId')
    async updateMemberChannel(
        @Param('userId') userId: number,
        @Param('channelId') channelId: number,
        @Body() updates: UpdateChannelDto) {
        return await this.channelService.updateChannelMember(userId, channelId, updates);
    }

    @Delete(':channelId')
    async deleteChannel(
        @Param('channelId') channelId: number) {
        return await this.channelService.deleteChannel(channelId);
    }

    @Delete(':channelId/:userId')
    async deleteChannelMember(
        @Param('userId') userId: number,
        @Param('channelId') channelId: number) {
        return await this.channelService.deleteChannelMember(userId, channelId);
    }
}
