import { Observable } from 'rxjs';
import { User, Friend } from '../models/user.entity';
import { JwtService } from "@nestjs/jwt";
import { UserService } from '../service/user.service';
export declare const storage: {
    storage: any;
};
export declare class UserController {
    private userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    add(user: User): any;
    delete(idToDelete: string): any;
    findAll(): any;
    findUserById(userId: number): Observable<User>;
    getFriendList(req: any): Promise<Friend[]>;
    addFriend(req: any, friendToAdd: any): Promise<void>;
    deleteFriend(req: any, friendToDelete: any): Promise<void>;
    userInfo(req: any, userName: any): Promise<void>;
    uploadFile(file: any, req: any): Observable<Object>;
    findProfileImage(req: any, res: any): any;
    getUserStatus(username: number): Promise<string>;
    setUserStatus(req: any, newStatus: any): Promise<void>;
}
