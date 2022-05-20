import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ChannelService } from '../service/channel.service';
import { CreateChannelDto } from '../models/channel.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PasswordI } from '../models/password.interface';
import { UpdateMemberChannelDto } from 'src/channelMember/models/channelMember.dto';

@Controller('channel')
export class ChannelController {
    constructor(
        private readonly channelService: ChannelService,
    ) {}

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
    async findMessagesByChannelId(@Param('channelId') channelId: number) {
        const channel = await this.channelService.findChannelById(channelId);
        return this.channelService.findChannelMessagesByChannelId(channel.id);
    } 

    @Get(':channelId/members')
    async findChannelMembersByChannelId(@Param('channelId') channelId: number) {
        return this.channelService.findMembers(channelId);
    }

    @Get(':channelId/owner')
    async findChannelOwner(@Param('channelId') channelId: number) {
        return this.channelService.findOwner(channelId);
    }

    @Get(':channelId/admins')
    async findChannelAdmins(@Param('channelId') channelId: number) {
        return this.channelService.findAdmins(channelId);
    }
    
    // test : curl -v  -X POST -d '{"name":"room42", "type": 1,  "password":"supersecuremdp"}' -H "Content-Type: application/json" http://localhost:3000/channel/createChannel
    @UseGuards(JwtAuthGuard) // user has to be connected
    @Post('/createChannel')
    async createChannel(
        @Req() request,
        @Body() channelDto: CreateChannelDto) {
            await this.channelService.createChannel(channelDto, request.user.id);
    }

    // test : curl -v  -X POST -d '{"secondUserId": "2", { "name":"room42", "type": 1,  "password":"supersecuremdp" }}' -H "Content-Type: application/json" http://localhost:3000/channel/
    @UseGuards(JwtAuthGuard)
    @Post('/createDmChannel')
    async createDmChannel(
        @Req() request,
        @Body() secondUserId: number,
        @Body() channelDto: CreateChannelDto) {
        await this.channelService.createDmChannel(channelDto, request.user.id, secondUserId);
    }

    // test : curl -v -X POST -d '{"oldPassword":"oldpass", "newPassword":"newpass"}' -H "Content-Type: application/json" http://localhost:3000/channel/{channelId}/changePass
    @UseGuards(JwtAuthGuard)
    @Post(':channelId/changePass')
    changePassword(
        @Param('channelId') channelId: number,
        @Req() request,
        @Body() passwords: PasswordI) {
        return this.channelService.changePassword(channelId, request.user.id, passwords);
    }

    // test : curl -v  -X Post -d '{"muted": true }' -H "Content-Type: application/json" http://localhost:3000/channel/{channelId}/{userId}
    @UseGuards(JwtAuthGuard)
    @Post(':channelId/:userId')
    async updateMemberChannel(
        @Req() request,
        @Param('userId') userId: number,
        @Param('channelId') channelId: number,
        @Body() updates: UpdateMemberChannelDto) {
        return await this.channelService.updateChannelMember(request.user.id, userId, channelId, updates);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':channelId')
    async deleteChannel(
        @Req() request,
        @Param('channelId') channelId: number) {
        return await this.channelService.deleteChannel(request.user.id, channelId);
    }

    @Delete(':channelId/:userId')
    async deleteChannelMember(
        @Param('userId') userId: number,
        @Param('channelId') channelId: number) {
        return await this.channelService.deleteChannelMember(userId, channelId);
    }

}
