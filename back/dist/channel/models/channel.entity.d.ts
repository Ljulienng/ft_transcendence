import { Message } from "src/message/models/message.entity";
import { User } from "src/user/models/user.entity";
export declare class Channel {
    readonly id: number;
    name: string;
    type: string;
    password: string;
    readonly createdTime: Date;
    messages: Message[];
    owner: User;
}
