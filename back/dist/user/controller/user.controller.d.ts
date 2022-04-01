import { Observable } from 'rxjs';
import { UserService } from '../service/user.service';
import { UserI } from '../models/user.interface';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    add(user: UserI): Observable<UserI>;
    findAll(): Observable<UserI[]>;
}
