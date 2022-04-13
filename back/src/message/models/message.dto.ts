import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Message } from './message.entity';

export class MessageDto {

    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @IsNotEmpty()
    @IsString()
    content: string;

    constructor(message: Message) {
        this.userId = message.user.id;
        this.content = message.content;
    }

}