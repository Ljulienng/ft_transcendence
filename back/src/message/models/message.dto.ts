import { User } from "src/user/models/user.entity";

export class CreateMessageDto {

    userId: number;
    username: string;
    content: string;
    channelId: number;

}