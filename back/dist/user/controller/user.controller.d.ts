import { Observable } from 'rxjs';
import { User, Friend } from '../models/user.entity';
import { JwtService } from "@nestjs/jwt";
import { UserService } from '../service/user.service';
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
    userInfo(req: any, userName: any): Promise<void>;
}
