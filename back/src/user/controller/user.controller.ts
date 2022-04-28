import { Controller, Get, Post, Delete, Body, Req, UnauthorizedException, ConsoleLogger, UseGuards, Param} from '@nestjs/common';
import { Observable } from 'rxjs';
import { User, Friend } from '../models/user.entity';
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

	@Delete('/delete')
	delete(@Body() idToDelete: string): any {
		return this.userService.delete(idToDelete);
	}

	@Get()
	findAll() {
		return this.userService.findAll();
	}

	@Get('/info/:userId')
	findUserById(@Param('userId') userId: number): Observable<User> {
		console.log("went in userId");
		return this.userService.findByUserId(userId);
	}

	@UseGuards(JwtAuthGuard)
	@Get('/friendlist')
	async getFriendList(@Req() req) {
		try {
			const user = req.user;

			return await this.userService.friendList(user);
		} catch(e) {
			throw new UnauthorizedException("Error: getFriendList");

		}
	}

	@UseGuards(JwtAuthGuard)
	@Post('/addfriend')
	async addFriend(@Req() req, @Body() friendToAdd) {
		let user: User;
		try {
			user = req.user;
		} catch (e) {
			throw new UnauthorizedException("Error: user isn't recognized");
		}
		await this.userService.addFriend(user, friendToAdd);
	}

	@UseGuards(JwtAuthGuard)
	@Delete('/deletefriend')
	async deleteFriend(@Req() req, @Body() friendToDelete) {
		try {
			// console.log("friend to delete= " ,friendToDelete)
			const user = req.user;
			
			await this.userService.deleteFriend(user, friendToDelete);

		} catch (e) {
			throw new UnauthorizedException("Error: deleteFriend")
		}
	}

	@UseGuards(JwtAuthGuard)
	@Post('/setusername')
	async userInfo(@Req() req, @Body() userName) {
	  try {
		// const cookie = req.cookies['jwt'];
  
		// const data = await this.jwtService.verifyAsync(cookie);
		// if (!data) {
		//   throw new UnauthorizedException("User not found");
		// }
  
		// const user = await this.userService.findOne(data['email']); //A changer
		// console.log(userName);
		// console.log("username name = ", userName.username)
		const user = req.user;
  
		this.userService.setUsername(user.id, userName.username);
	  }
	  catch (e) {
		throw new UnauthorizedException("Username is already set.");
	  }
	}

}
