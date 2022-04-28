import { VerifyCallback } from 'passport-42';
import { User } from "src/user/models/user.entity";
import { FortyTwoService } from "../fortytwo.service";
declare const FortyTwoStrategy_base: new (...args: any[]) => any;
export declare class FortyTwoStrategy extends FortyTwoStrategy_base {
    private readonly fortyTwoService;
    constructor(fortyTwoService: FortyTwoService);
    validate(accessToken: string, refreshToken: string, profile: any, cb: VerifyCallback): Promise<User>;
}
export {};
