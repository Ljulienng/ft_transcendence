import { Injectable  } from "@nestjs/common";
import { UserService } from "src/user/service/user.service";
import { User } from "src/user/models/user.entity";
import { Student } from "src/user/dto/student.dto";
import { Observable } from "rxjs";

@Injectable()
export class FortyTwoService {
	constructor(private userService: UserService) {}

	createUser(user: Student): Observable<User> {
		return this.userService.add(user);
	}

	async validateUser(user: Student): Promise<User> {
		return this.userService.validateStudent(user);
	}
}