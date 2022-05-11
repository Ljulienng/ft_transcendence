import { Message } from "src/message/models/message.entity";
import { Channel } from "src/channel/models/channel.entity";
import { ChannelMember } from "src/channelMember/models/channelMember.entity";
export declare type Friend = {
    username: string;
    firstname: string;
    lastname: string;
};
export declare class User {
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    admin: boolean;
    banned: boolean;
    twoFASecret: string;
    twoFAEnabled: boolean;
    readonly createdTime: Date;
    messages: Message[];
    channels: Channel[];
    channelMembers: ChannelMember[];
    friends: string[];
    profileImage: string;
}
