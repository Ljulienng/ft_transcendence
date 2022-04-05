import { Controller, Get, Post, Body } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserEntity } from '../models/user.entity';
import { UserService } from '../service/user.service';
// import { UserI } from '../models/user.interface';

@Controller('users')
export class UserController {

	constructor(private userService: UserService) {}

	@Post()
	add(@Body() user: UserEntity): any {
		return this.userService.add(user);
	}

	@Get()
	findAll() {
		return this.userService.findAll();
	}

}
