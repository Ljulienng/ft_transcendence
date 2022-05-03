import { ChannelService } from '../service/channel.service';
import { CreateChannelDto } from '../models/createChannel.dto';
export declare class ChannelController {
    private readonly channelService;
    constructor(channelService: ChannelService);
    findAll(): Promise<import("../models/channel.entity").Channel[]>;
    findChannelById(id: string): Promise<import("../models/channel.entity").Channel>;
    createChannel(channelDto: CreateChannelDto): Promise<import("../models/channel.entity").Channel>;
    deleteChannel(id: string): Promise<import("../models/channel.entity").Channel>;
}
