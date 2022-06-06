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
import { TwoFAAuth } from 'src/auth/guards/twoFA.guard';
// import { UserI } from '../models/user.interface';

export const storage = {
	storage: diskStorage({
		destination: './uploads/profileimages',
		filename: (req, file, cb) => {
			const filename: string = req.user.username;
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

	@UseGuards(JwtAuthGuard, TwoFAAuth)
	@Get()
	findAll() {
		return this.userService.findAll();
	}

	@Get('/info/:userId')
	findUserById(@Param('userId') userId: number): Observable<User> {
		// console.log("went in userId");
		return this.userService.findByUserId(userId);
	}

	@UseGuards(JwtAuthGuard, TwoFAAuth)
	@Get('/friendlist')
	async getFriendList(@Req() req) {
		try {
			const user = req.user;

			return await this.userService.friendList(user);
		} catch(e) {
			throw new UnauthorizedException("Error: getFriendList");

		}
	}

	@UseGuards(JwtAuthGuard, TwoFAAuth)
	@Get('/ownedchannel')
	async getOwnedChannel(@Req() req) {
		try {
			const user = req.user;

			return await this.userService.ownedChannel(user);
		} catch(e) {
			throw new UnauthorizedException("Error: getJoinedChannel");
		
		}
	}

	@UseGuards(JwtAuthGuard, TwoFAAuth)
	@Get('/joinedchannel')
	async getJoinedChannel(@Req() req) {
		try {
			const user = req.user;

			return await this.userService.joinedChannel(user);
		} catch(e) {
			throw new UnauthorizedException("Error: getJoinedChannel");
		
		}
	}

	// =========== FRIENDS =============

	@UseGuards(JwtAuthGuard, TwoFAAuth)
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

	@UseGuards(JwtAuthGuard, TwoFAAuth)
	@Delete('/deletefriend')
	async deleteFriend(@Req() req, @Body() friendToDelete) {
		try {
			// console.log("friend to delete= " ,friendToDelete)
			const user = req.user;
			
			await this.userService.deleteFriend(user, friendToDelete.username);

		} catch (e) {
			throw e
		}
	}

	// =========== USER PROFILE  =============

	@UseGuards(JwtAuthGuard, TwoFAAuth)
	@Post('/setusername')
	async userInfo(@Res({passthrough: true}) res, @Req() req, @Body() userName) {
	  try {
		const user = req.user;
  
		await this.userService.setUsername(user, userName.username);
		const payload = { username: (await this.userService.findOne({id: user.id})).username, auth: false };
		const accessToken = await this.jwtService.signAsync(payload);
		if (req.user.status === 'Offline')
			req.user.status = 'Online';
		res.clearCookie('jwt');
		res.cookie('jwt', accessToken, {httpOnly: true})
		// res.redirect('http://localhost:3001/home');
	}
	  catch (e) {
		throw e;
	  }
	}

	@Post('/uploadavatar')
	@UseGuards(JwtAuthGuard, TwoFAAuth)
	@UseInterceptors(FileInterceptor('image', storage))
	uploadFile(@UploadedFile() file, @Req() req): Observable<Object> {
		const user: User = req.user;

		return this.userService.updateOne(user.id, {profileImage: file.filename}).pipe(
			tap((user: User) => console.log(user)),
			map((user: User) => ({profileImage: user.profileImage}))
		)
		// return of({imagePath: file.path});
	}

	@UseGuards(JwtAuthGuard, TwoFAAuth)
	@Get('/avatar')
	findProfileImage(@Req() req, @Res() res) {
		if (req.user.profileImage)
			return (res.sendFile(join(process.cwd(), '/uploads/profileimages/' + req.user.profileImage)))
		else
			return (res.sendFile(join(process.cwd(), '/uploads/profileimages/' + 'default/default.jpg')))
	}

	@UseGuards(JwtAuthGuard, TwoFAAuth)
	@Get('/status')
	async getUserStatus(@Req() req): Promise<string> {
		try {
			const user = await this.userService.findOne({username: req.user.username});

			return user.status
		} catch(e) {
			console.log(e);
		}

	}

	// =========== PRIVATE CHAT PART =============

	@UseGuards(JwtAuthGuard, TwoFAAuth)
	@Get("/message/:friendUsername")
	async getMessages(@Param('friendUsername') friendUsername: string, @Req() req) {
		try {
			const user = req.user;
			const friend = await this.userService.findByUsername(friendUsername);
			const messages = await this.userService.getMessage(user.id, friend.id)

			return messages;
		} catch(e) {
			console.log("/message/:friendUsername", e)
		}
	}

	// =========== BLOCK PART =============

	@UseGuards(JwtAuthGuard, TwoFAAuth)
	@Get("/getblocked")
	async getBlockedList(@Req() req) {
		try {
			const user = req.user;

			return this.userService.getBlockedUser(user);
		} catch(e) {
			console.log(e);
		}
	}

	// =========== MATCH PART =============

	@UseGuards(JwtAuthGuard, TwoFAAuth)
	@Get("/matchhistory")
	async getMatchHistory(@Req() req) {
		try {
			const user = req.user;

			return this.userService.getMatchHistory(user);
		} catch(e) {
			console.log(e);
		}
	}

	@UseGuards(JwtAuthGuard, TwoFAAuth)
	@Get("/stats")
	getUserStats(@Req() req) {
		try {
			const user = req.user;
			console.log("user = ", user)
			const stats = {
				gameWon: user.gameWon,
				gameLost: user.gameLost,
				ranking: user.ranking,
				points: user.points,
			}

			return stats;
		} catch(e) {

		}
	}
}
