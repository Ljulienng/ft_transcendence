import { Message } from "src/message/models/message.entity";
import { User } from "src/user/models/user.entity";
import { ChannelMember } from "src/channelMember/models/channelMember.entity";
export declare enum ChannelType {
    private = 0,
    protected = 1,
    public = 2
}
export declare class Channel {
    readonly id: number;
    name: string;
    type: ChannelType;
    password: string;
    readonly createdTime: Date;
    messages: Message[];
    channelMembers: ChannelMember[];
    owner: User;
    membersId: number[];
}
