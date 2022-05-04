import { UserService } from "src/user/service/user.service";
import { User } from "src/user/models/user.entity";
import { JwtService } from "@nestjs/jwt";
import { Student } from "src/user/dto/student.dto";
import { Observable } from "rxjs";
export declare class FortyTwoService {
    protected userService: UserService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    createUser(user: Student): Observable<User>;
    validateUser(user: Student): Promise<User>;
}
