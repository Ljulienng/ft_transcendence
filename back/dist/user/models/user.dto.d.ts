import { Message } from "src/message/models/message.entity";
import { Channel } from "src/channel/models/channel.entity";
export declare class UserDto {
    id: number;
    firstname: string;
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
    string: number[];
    profileImage?: string;
}
