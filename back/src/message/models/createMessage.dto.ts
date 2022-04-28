import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { User } from 'src/user/models/user.entity';
import { Message } from './message.entity';

export class CreateMessageDto {

    user: User;
    content: string;
    channelId: number;

}