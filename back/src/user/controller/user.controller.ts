import { Controller, Get, Post, Body, Req, UnauthorizedException, ConsoleLogger, UseGuards} from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '../models/user.entity';
import { JwtService } from "@nestjs/jwt"
import { UserService } from '../service/user.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { UserI } from '../models/user.interface';

@Controller('users')
export class UserController {

	constructor(private userService: UserService, private jwtService: JwtService) {}

	@Post()
	add(@Body() user: User): any {
		return this.userService.add(user);
	}

	@Post('/delete')
	delete(@Body() idToDelete: string): any {
		return this.userService.delete(idToDelete);
	}

	@Get()
	findAll() {
		return this.userService.findAll();
	}

	@UseGuards(JwtAuthGuard)
	@Get('/userinfo')
	async userInfo(@Req() req) {
	  try {
		const cookie = req.cookies['jwt'];
  
		const data = await this.jwtService.verifyAsync(cookie);
		if (!data) {
		  throw new UnauthorizedException("User not found");
		}
  
		const user = await this.userService.findOne(data['email']); //A changer 
  
		return data;
	  }
	  catch (e) {
		throw new UnauthorizedException();
	  }
	}

}
