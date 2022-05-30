import { User } from "src/user/models/user.entity";

export class CreateMessageUserDto {

    senderId: number;
    sender: string;
    receiverId: number;
    content: string;

}