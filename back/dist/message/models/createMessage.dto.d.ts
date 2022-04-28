import { User } from 'src/user/models/user.entity';
export declare class CreateMessageDto {
    user: User;
    content: string;
    channelId: number;
}
