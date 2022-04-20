import { Message } from "src/message/models/message.entity";
import { Channel } from "src/channel/models/channel.entity";
import { FriendRequest } from './friend-request.entity';
export declare class UserDto {
    id: number;
    firsname: string;
    lastname: string;
    username: string;
    email: string;
    admin: boolean;
    banned: boolean;
    twoFASecret: string;
    twoFAEnabled: boolean;
    createdTime: Date;
    messages: Message[];
    channels: Channel[];
    friends: number[];
    sentFriendRequests: FriendRequest[];
    receivedFriendRequests: FriendRequest[];
}
