import { ChannelService } from '../service/channel.service';
import { CreateChannelDto } from '../models/createChannel.dto';
import { CreateMessageDto } from 'src/message/models/createMessage.dto';
import { MessageService } from 'src/message/service/message.service';
export declare class ChannelController {
    private readonly channelService;
    private messageService;
    constructor(channelService: ChannelService, messageService: MessageService);
    findAll(): Promise<import("../models/channel.entity").Channel[]>;
    findChannelById(channelId: number): Promise<import("../models/channel.entity").Channel>;
    findChannelByName(name: string): Promise<import("../models/channel.entity").Channel>;
    testPostMessage(): void;
    findMessagesByChannelId(channelId: number): Promise<CreateMessageDto[]>;
    createChannel(request: any, channelDto: CreateChannelDto): Promise<import("../models/channel.entity").Channel>;
    deleteChannel(channelId: number): Promise<import("../models/channel.entity").Channel>;
}
