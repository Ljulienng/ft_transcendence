import { Controller, Get, UseGuards, Req, Res, UnauthorizedException, ConsoleLogger } from '@nestjs/common';
import { FortyTwoService } from './fortytwo.service';
import { AuthGuard } from '@nestjs/passport'
import { get } from 'http';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FortyTwoAuthGuard } from './guards/fortytwo.guard';
import { JwtService } from "@nestjs/jwt"
import { UserService } from 'src/user/service/user.service';

@Controller()
export class AuthController {
  constructor(private readonly fortyTwoService: FortyTwoService, private userService: UserService ,private jwtService: JwtService) {}

  @UseGuards(FortyTwoAuthGuard)
  @Get('/auth/42')
  async FortyTwoAuth(@Req() req)  {
  }

  @UseGuards(FortyTwoAuthGuard)
  @Get('/auth/42/callback')
  async FortyTwoAuthRedirect(@Req() req, @Res({passthrough: true}) res) {
    const payload = { username: req.user['username'], auth: false };
		const accessToken = await this.jwtService.signAsync(payload);
		res.cookie('jwt', accessToken, {httpOnly: true})
		res.redirect('http://localhost:3001/home');
  }

  @UseGuards(JwtAuthGuard)
  @Get('userinfo')
  async userinfo(@Req() req) {
    // return req.user;
    try {
		const cookie = req.cookies['jwt'];
  
		const data = await this.jwtService.verifyAsync(cookie);
		if (!data) {
		  throw new UnauthorizedException("User not found");
		}
  
		const user = await this.userService.findOne(data['email']); //A changer 
  
		return user;
	  } catch (e) {
		throw new UnauthorizedException("wtf");
	  }
  }
}
