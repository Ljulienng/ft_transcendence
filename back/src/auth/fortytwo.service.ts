import { Injectable  } from "@nestjs/common";
import { UserService } from "src/user/service/user.service";
import { User } from "src/user/models/user.entity";
import { UserDto } from "src/user/models/user.dto";
import { Observable } from "rxjs";

@Injectable()
export class FortyTwoService {
	constructor(private userService: UserService) {}

	createUser(user: UserDto): Observable<User> {
		return this.userService.add(user);
	}

	async validateUser(user: UserDto): Promise<User> {
		return this.userService.validateStudent(user);
	}
}