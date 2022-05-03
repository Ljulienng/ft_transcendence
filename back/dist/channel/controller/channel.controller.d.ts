import { ChannelService } from '../service/channel.service';
import { CreateChannelDto } from '../models/createChannel.dto';
import { CreateMessageDto } from 'src/message/models/createMessage.dto';
import { MessageService } from 'src/message/service/message.service';
import { Request } from 'src/user/models/user.interface';
export declare class ChannelController {
    private readonly channelService;
    private messageService;
    constructor(channelService: ChannelService, messageService: MessageService);
    findAll(): Promise<import("../models/channel.entity").Channel[]>;
    findChannelById(channelId: number): Promise<import("../models/channel.entity").Channel>;
    findChannelByName(name: string): Promise<import("../models/channel.entity").Channel>;
    testPostMessage(): void;
    findMessagesByChannelId(channelId: number): Promise<CreateMessageDto[]>;
    createChannel(request: Request, channelDto: CreateChannelDto): void;
    deleteChannel(channelId: number): Promise<import("../models/channel.entity").Channel>;
}
