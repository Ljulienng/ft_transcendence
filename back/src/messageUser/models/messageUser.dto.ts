import { User } from "src/user/models/user.entity";

export class CreateMessageUserDto {

    senderId: number;
    receiverlId: number;
    content: string;

}