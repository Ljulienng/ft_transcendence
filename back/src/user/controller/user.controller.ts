import { Controller, Get, Post, Delete, Body, Req, Res, UnauthorizedException, ConsoleLogger, UseGuards, Param, UseInterceptors, UploadedFile, } from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';
import { User, Friend } from '../models/user.entity';
import { JwtService } from "@nestjs/jwt"
import { UserService } from '../service/user.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid'
import path = require('path');
import { map } from 'rxjs';
import { join } from 'path';
import { fileURLToPath } from 'url';
// import { UserI } from '../models/user.interface';

export const storage = {
	storage: diskStorage({
		destination: './uploads/profileimages',
		filename: (req, file, cb) => {
			const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
			const extension: string = path.parse(file.originalname).ext;

			cb(null, filename + extension);
		}
	})
}

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
			await this.userService.addFriend(user, friendToAdd);
		} catch (e) {
			throw e;
		}
	}

	@UseGuards(JwtAuthGuard)
	@Delete('/deletefriend')
	async deleteFriend(@Req() req, @Body() friendToDelete) {
		try {
			// console.log("friend to delete= " ,friendToDelete)
			const user = req.user;
			
			await this.userService.deleteFriend(user, friendToDelete);

		} catch (e) {
			throw e
		}
	}

	@UseGuards(JwtAuthGuard)
	@Post('/setusername')
	async userInfo(@Req() req, @Body() userName) {
	  try {
		const user = req.user;
  
		this.userService.setUsername(user.id, userName.username);
	  }
	  catch (e) {
		throw e;
	  }
	}

	@Post('/uploadavatar')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor('image', storage))
	uploadFile(@UploadedFile() file, @Req() req): Observable<Object> {
		console.log("filename = ", file.filename)
		console.log("req = ", req)
		const user: User = req.user;

		return this.userService.updateOne(user.id, {profileImage: file.filename}).pipe(
			tap((user: User) => console.log(user)),
			map((user: User) => ({profileImage: user.profileImage}))
		)
		// return of({imagePath: file.path});
	}

	@UseGuards(JwtAuthGuard)
	@Get('/avatar/:imagename')
	findProfileImage(@Param('imagename') imagename, @Res() res) {
		return (res.sendFile(join(process.cwd(), '/uploads/profileimages' + imagename)))
	}

}
