import { Channel } from "src/channel/models/channel.entity";
import { User } from 'src/user/models/user.entity';
export declare class Message {
    readonly id: number;
    content: string;
    readonly createdTime: Date;
    user: User;
    channel: Channel;
}
