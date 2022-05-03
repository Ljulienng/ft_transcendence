import { Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { Student } from "src/user/dto/student.dto";
import { User, Friend } from '../models/user.entity';
export declare class UserService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    add(user: User): any;
    addStudent(user: Student): any;
    delete(id: string): Promise<void>;
    setUsername(userId: number, userName: string): Promise<void>;
    findAll(): any;
    findByUserId(userId: number): Observable<User>;
    findByUsername(name: string): Promise<User>;
    findOne(id: any): Promise<User>;
    validateStudent(user: Student): Promise<User>;
    addFriend(user: User, friendToAdd: any): Promise<void>;
    deleteFriend(user: User, friendToDelete: any): Promise<void>;
    retrieveFriendInfo(friendId: string): Promise<Friend>;
    friendList(user: User): Promise<Friend[]>;
}
