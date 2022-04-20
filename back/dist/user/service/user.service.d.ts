import { Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { Student } from "src/user/dto/student.dto";
import { User } from '../models/user.entity';
import { FriendRequest } from '../models/friend-request.entity';
import { FriendRequestStatus } from '../models/friend-request.dto';
export declare class UserService {
    private userRepository;
    private friendRequestRepository;
    constructor(userRepository: Repository<User>, friendRequestRepository: Repository<FriendRequest>);
    add(user: User): any;
    addStudent(user: Student): any;
    delete(id: string): Promise<void>;
    findAll(): any;
    findByUserId(userId: number): Observable<User>;
    findByUsername(name: string): Promise<User>;
    findOne(id: any): Promise<User>;
    validateStudent(user: Student): Promise<User>;
    hasRequestBeenSentOrReceived(creator: User, receiver: User): Observable<boolean>;
    sendFriendRequest(creator: User, receiverId: number): Observable<FriendRequest | {
        error: string;
    }>;
    getFriendRequestStatus(currentUser: User, receiverId: number): Observable<FriendRequestStatus>;
    getFriendRequestUserById(friendRequestId: number): Observable<FriendRequest>;
}
