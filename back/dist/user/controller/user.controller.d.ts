import { Observable } from 'rxjs';
import { User } from '../models/user.entity';
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
    userInfo(req: any): Promise<any>;
}
