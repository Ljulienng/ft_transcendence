import { User } from "./user.entity";

export type FriendRequest_Status = 'pending' | 'accepted' | 'declined' | 'not-sent' | 'waiting-response';

export interface FriendRequestStatus {
	status?: FriendRequest_Status
}

export class FriendRequestDto {
	id?: number;
	creator?: User;
	receiver?:User;
	status?: FriendRequest_Status;
}