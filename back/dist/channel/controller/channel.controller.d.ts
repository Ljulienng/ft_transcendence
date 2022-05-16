import { ChannelService } from '../service/channel.service';
import { CreateChannelDto } from '../models/channel.dto';
import { CreateMessageDto } from 'src/message/models/message.dto';
import { PasswordI } from '../models/password.interface';
import { UpdateMemberChannelDto } from 'src/channelMember/models/channelMember.dto';
export declare class ChannelController {
    private readonly channelService;
    constructor(channelService: ChannelService);
    findAll(): Promise<import("../models/channel.entity").Channel[]>;
    findChannelById(channelId: number): Promise<import("../models/channel.entity").Channel>;
    findChannelByName(name: string): Promise<import("../models/channel.entity").Channel>;
    findMessagesByChannelId(channelId: number): Promise<CreateMessageDto[]>;
    createChannel(request: any, channelDto: CreateChannelDto): Promise<void>;
    changePassword(channelId: number, request: any, passwords: PasswordI): Promise<void>;
    updateMemberChannel(request: any, userId: number, channelId: number, updates: UpdateMemberChannelDto): Promise<void>;
    deleteChannel(channelId: number): Promise<import("../models/channel.entity").Channel>;
    deleteChannelMember(userId: number, channelId: number): Promise<void>;
}
