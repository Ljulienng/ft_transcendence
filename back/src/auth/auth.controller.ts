import { Controller, Get, Body, UseGuards, Req, Res, UnauthorizedException, Delete ,ConsoleLogger, Param, Post, HttpCode } from '@nestjs/common';
import { FortyTwoService } from './fortytwo.service';
import { AuthGuard } from '@nestjs/passport'
import { get } from 'http';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FortyTwoAuthGuard } from './guards/fortytwo.guard';
import { User } from 'src/user/models/user.entity';
import { from, Observable, of, switchMap, map } from 'rxjs';
import { TwoFactorAuthenticationService } from './twofactorauth.service'
import { JwtService } from "@nestjs/jwt"
import { UserService } from 'src/user/service/user.service';

@Controller()
export class AuthController {
  constructor(private readonly fortyTwoService: FortyTwoService, private userService: UserService, private jwtService: JwtService, private twoFAService: TwoFactorAuthenticationService ) {}

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
    try {
    const user = req.user;

		return user;
	  } catch (e) {
		throw new UnauthorizedException("wtf");
	  }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/twofa/generate')
  async register(@Res() response, @Req() req) {
    const { otpauthUrl } = await this.twoFAService.generateTwoFactorAuthenticationSecret(req.user);
 
    return this.twoFAService.pipeQrCodeStream(response, otpauthUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/twofa/turn-on')
  @HttpCode(200)
  async turnOnTwoFactorAuthentication(
    @Req() req,
    @Body() twoFactorAuthenticationCode) {
      // console.log('twoFactorAuthenticationCode = ', twoFactorAuthenticationCode.twoFactorAuthenticationCode);
    const isCodeValid = this.twoFAService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode.twoFactorAuthenticationCode, req.user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    // console.log('double FA ACTIVATED FOR ', req.user.username)
    await this.userService.turnOnTwoFactorAuthentication(req.user.id);
  }

  @Post('/twofa/turn-off')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async turnOffTwoFactorAuthentication(
    @Req() req,
    @Res() res,
    @Body() twoFactorAuthenticationCode) {
      // console.log('twoFactorAuthenticationCode = ', twoFactorAuthenticationCode.twoFactorAuthenticationCodeTwo);
    const user: User = req.user;
    const isCodeValid = this.twoFAService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode.twoFactorAuthenticationCodeTwo, req.user
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    // console.log('double FA DEACTIVATED FOR ', req.user.username)
    await this.userService.turnOffTwoFactorAuthentication(req.user.id);
  
    const payload = { username: req.user['username'], auth: false };
		const accessToken = await this.jwtService.signAsync(payload);
		res.clearCookie('jwt');
    res.cookie('jwt', accessToken, {httpOnly: true})
		res.redirect('http://localhost:3001/home');
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('/twofa/authenticate')
  @HttpCode(200)
  async twoFAAuthenticate(
    @Req() req,
    @Res() res,
    @Body() twoFactorAuthenticationCode) {
    const user: User = req.user;

      // console.log('twoFactorAuthenticationCode = ', twoFactorAuthenticationCode.twoFactorAuthenticationCode);
    const isCodeValid = this.twoFAService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode.twoFactorAuthenticationCode, req.user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    // console.log('TWOFA AUTHENTICATE =', req.user.username, user.twoFASecret)

    const payload = { username: req.user['username'], auth: true };
		const accessToken = await this.jwtService.signAsync(payload);
		res.clearCookie('jwt');
    res.cookie('jwt', accessToken, {httpOnly: true})
		res.redirect('http://localhost:3001/home');
  }

  @UseGuards(JwtAuthGuard)
  @Get('/twofa/check')
  async checkAuthentication(@Req()req) {
    const user: User = req.user;
    const decode = this.jwtService.decode(req.cookies.jwt);

    if (user.twoFAEnabled === true && decode['auth'] === true)
      return (true)
    else
      return (false)
  }

	@UseGuards(JwtAuthGuard)
	@Delete('/logout')
	logout(@Res({passthrough: true}) res) {
		res.clearCookie('jwt');
	}
}
