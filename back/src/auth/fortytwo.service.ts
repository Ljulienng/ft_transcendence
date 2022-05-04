import { Injectable, Res, Req } from "@nestjs/common";
import { UserService } from "src/user/service/user.service";
import { User } from "src/user/models/user.entity";
import { UserDto } from "src/user/models/user.dto";
import { JwtService } from "@nestjs/jwt"
import { Student } from "src/user/dto/student.dto"
import { Observable } from "rxjs";

@Injectable()
export class FortyTwoService {
	constructor(protected userService: UserService, private jwtService: JwtService) {}

	createUser(user: Student): Observable<User> {
		return this.userService.addStudent(user);
	}

	async validateUser(user: Student): Promise<User> {
		return this.userService.validateStudent(user);
	}

}