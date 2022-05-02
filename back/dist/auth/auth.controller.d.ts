import { FortyTwoService } from './fortytwo.service';
import { JwtService } from "@nestjs/jwt";
import { UserService } from 'src/user/service/user.service';
export declare class AuthController {
    private readonly fortyTwoService;
    private userService;
    private jwtService;
    constructor(fortyTwoService: FortyTwoService, userService: UserService, jwtService: JwtService);
    FortyTwoAuth(req: any): Promise<void>;
    FortyTwoAuthRedirect(req: any, res: any): Promise<void>;
    userinfo(req: any): Promise<any>;
}
