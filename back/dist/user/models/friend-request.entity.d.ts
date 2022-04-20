import { User } from './user.entity';
import { FriendRequest_Status } from './friend-request.dto';
export declare class FriendRequest {
    id: number;
    creator: User;
    receiver: User;
    status: FriendRequest_Status;
}
