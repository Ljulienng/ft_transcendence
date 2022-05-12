import { ChannelService } from '../service/channel.service';
import { CreateChannelDto, UpdateChannelDto } from '../models/channel.dto';
import { CreateMessageDto } from 'src/message/models/message.dto';
import { MessageService } from 'src/message/service/message.service';
import { PasswordI } from '../models/password.interface';
export declare class ChannelController {
    private readonly channelService;
    private messageService;
    constructor(channelService: ChannelService, messageService: MessageService);
    findAll(): Promise<import("../models/channel.entity").Channel[]>;
    findChannelById(channelId: number): Promise<import("../models/channel.entity").Channel>;
    findChannelByName(name: string): Promise<import("../models/channel.entity").Channel>;
    findMessagesByChannelId(channelId: number): Promise<CreateMessageDto[]>;
    createChannel(request: any, channelDto: CreateChannelDto): Promise<import("../models/channel.entity").Channel>;
    changePassword(channelId: number, request: any, passwords: PasswordI): Promise<void>;
    updateMemberChannel(userId: number, channelId: number, updates: UpdateChannelDto): Promise<void>;
    deleteChannel(channelId: number): Promise<import("../models/channel.entity").Channel>;
    deleteChannelMember(userId: number, channelId: number): Promise<void>;
}
