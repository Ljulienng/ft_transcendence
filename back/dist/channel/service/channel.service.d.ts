import { Repository } from 'typeorm';
import { Channel } from '../models/channel.entity';
import { CreateChannelDto, UpdateChannelDto } from '../models/channel.dto';
import { Message } from 'src/message/models/message.entity';
import { User } from 'src/user/models/user.entity';
import { JoinChannelDto } from '../models/channel.dto';
import { PasswordI } from '../models/password.interface';
import { ChannelMemberService } from 'src/channelMember/service/channelMember.service';
export declare class ChannelService {
    private channelRepository;
    private userRepository;
    private messageRepository;
    private channelMemberService;
    constructor(channelRepository: Repository<Channel>, userRepository: Repository<User>, messageRepository: Repository<Message>, channelMemberService: ChannelMemberService);
    findAll(): Promise<Channel[]>;
    findChannelById(channelId: number): Promise<Channel>;
    findChannelByName(channelName: string): Promise<Channel>;
    createChannel(createChannel: CreateChannelDto, userId: number): Promise<Channel>;
    checkPasswordMatch(sentPassword: string, hashExpectedPassword: string): Promise<boolean>;
    addUserToChannel(joinChannel: JoinChannelDto, userId: number): Promise<void>;
    removeUserToChannel(channelSent: Channel, userId: number): Promise<void>;
    changePassword(channelId: number, userId: number, passwords: PasswordI): Promise<void>;
    deleteChannel(channelId: number): Promise<Channel>;
    updateChannelMember(userId: number, channelId: number, updates: UpdateChannelDto): Promise<void>;
    deleteChannelMember(userId: number, channelId: number): Promise<void>;
    getChannelMessagesByRoom(room: string): Promise<Message[]>;
    getChannelMessagesByRoomId(roomId: number): Promise<Message[]>;
    saveMessage(message: string, channelId: number): Promise<{
        content: string;
        channel: Channel;
    } & Message>;
}
