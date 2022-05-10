import { Controller, Get, UseGuards, Req, Res, UnauthorizedException, Delete ,ConsoleLogger, Param } from '@nestjs/common';
import { FortyTwoService } from './fortytwo.service';
import { AuthGuard } from '@nestjs/passport'
import { get } from 'http';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FortyTwoAuthGuard } from './guards/fortytwo.guard';
import { User } from 'src/user/models/user.entity';
import { from, Observable, of, switchMap, map } from 'rxjs';
import { JwtService } from "@nestjs/jwt"
import { UserService } from 'src/user/service/user.service';

@Controller()
export class AuthController {
  constructor(private readonly fortyTwoService: FortyTwoService, private userService: UserService ,private jwtService: JwtService) {}

  @UseGuards(FortyTwoAuthGuard)
  @Get('/auth/42')
  async FortyTwoAuth(@Req() req)  {
  }

  // @UseGuards(FortyTwoAuthGuard)
  @Get('/norminet')
  async Norminet(@Req() req, @Res({passthrough: true}) res) {
    const payload = { username: 'norminet', auth: false };
		const accessToken = await this.jwtService.signAsync(payload);
		res.cookie('jwt', accessToken, {httpOnly: true})
		// res.redirect('http://localhost:3001/home');
  }


  @UseGuards(FortyTwoAuthGuard)
  @Get('/auth/42/callback')
  async FortyTwoAuthRedirect(@Req() req, @Res({passthrough: true}) res) {
    const payload = { username: req.user['username'], auth: false };
		const accessToken = await this.jwtService.signAsync(payload);
    if (req.user.status === 'Offline')
      req.user.status = 'Online';
		res.cookie('jwt', accessToken, {httpOnly: true})
		res.redirect('http://localhost:3001/home');
  }

  @UseGuards(JwtAuthGuard)
  @Get('userinfo')
  async userinfo(@Req() req) {
    // return req.user;
    try {
		// const cookie = req.cookies['jwt'];
  
		// const data = await this.jwtService.verifyAsync(cookie);
		// if (!data) {
		//   throw new UnauthorizedException("User not found");
		// }
  
		// const user = await this.userService.findOne(data['email']); //A changer 
    const user = req.user;
    // console.log("userinfo ", user);

		return user;
	  } catch (e) {
		throw new UnauthorizedException("wtf");
	  }
  }


	@UseGuards(JwtAuthGuard)
	@Delete('/logout')
	logout(@Res({passthrough: true}) res) {
		res.clearCookie('jwt');
	}
}
