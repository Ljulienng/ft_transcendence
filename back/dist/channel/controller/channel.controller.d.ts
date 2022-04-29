import { ChannelService } from '../service/channel.service';
import { CreateChannelDto } from '../models/createChannel.dto';
import { Response } from 'express';
export declare class ChannelController {
    private readonly channelService;
    constructor(channelService: ChannelService);
    findAll(): Promise<import("../models/channel.entity").Channel[]>;
    findChannelById(id: number): Promise<import("../models/channel.entity").Channel>;
    findChannelByName(name: string): Promise<import("../models/channel.entity").Channel>;
    createChannel(channelDto: CreateChannelDto, response: Response): Promise<import("../models/channel.entity").Channel>;
    deleteChannel(id: number): Promise<import("../models/channel.entity").Channel>;
}
