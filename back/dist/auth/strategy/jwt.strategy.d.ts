import { UserService } from "src/user/service/user.service";
import { User } from "src/user/models/user.entity";
declare const JwtStrategy_base: new (...args: any[]) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private userService;
    constructor(userService: UserService);
    validate(payload: any): Promise<User>;
}
export {};
