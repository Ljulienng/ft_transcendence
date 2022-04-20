import { User } from "./user.entity";
export declare type FriendRequest_Status = 'pending' | 'accepted' | 'declined' | 'not-sent' | 'waiting-response';
export interface FriendRequestStatus {
    status?: FriendRequest_Status;
}
export declare class FriendRequestDto {
    id?: number;
    creator?: User;
    receiver?: User;
    status?: FriendRequest_Status;
}
