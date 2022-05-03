import { Message } from './message.entity';
export declare class MessageDto {
    userId: number;
    content: string;
    constructor(message: Message);
}
