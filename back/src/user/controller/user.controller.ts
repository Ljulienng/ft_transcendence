import { Controller, Get, Post, Body } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from '../service/user.service';
import { UserI } from '../models/user.interface';

@Controller('users')
export class UserController {

	constructor(private userService: UserService) {}

	@Post()
	add(@Body() user: UserI): Observable<UserI> {
		return this.userService.add(user);
	}

	@Get()
	findAll() {
		return this.userService.findAll();
	}

}
