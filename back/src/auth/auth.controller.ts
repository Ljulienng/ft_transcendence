import { Controller, Get, Body, UseGuards, Req, Res, UnauthorizedException, Delete ,UseInterceptors, Param, Post, HttpCode } from '@nestjs/common';
import { FortyTwoService } from './fortytwo.service';
import { AuthGuard } from '@nestjs/passport'
import { get } from 'http';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FortyTwoAuthGuard } from './guards/fortytwo.guard';
import { User } from 'src/user/models/user.entity';
import { from, Observable, of, switchMap, map } from 'rxjs';
import { TwoFactorAuthenticationService } from './twofactorauth.service'
import { JwtService } from "@nestjs/jwt"
import { TwoFAAuth } from './guards/twoFA.guard';
import { UserService } from 'src/user/service/user.service';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ReturningStatementNotSupportedError } from 'typeorm';

@Controller()
export class AuthController {
  constructor(private readonly fortyTwoService: FortyTwoService, private userService: UserService, private jwtService: JwtService, private twoFAService: TwoFactorAuthenticationService ) {}

  @UseGuards(FortyTwoAuthGuard)
  @Get('/auth/42')
  FortyTwoAuth(@Req() req)  {
  }

  // @UseGuards(FortyTwoAuthGuard)
  @Get('/norminet')
  async norminet(
    @Req() req,
    @Res({passthrough: true}) res,
    ) {
    const payload = { username: 'norminet', auth: false };
		const accessToken = await this.jwtService.signAsync(payload);
		res.cookie('jwt', accessToken, {httpOnly: true})
		// res.redirect('http://localhost:3001/home');
  }

  @Post('/testsignin')
  async testSignIn(
  @Req() req,
  @Res({passthrough: true}) res,
  @Body() newUsername
  ) {
    const tmp = newUsername.newUsername
    const user = await this.userService.findOne({username: tmp})

    if (!user) {
      const newUser: any = {
        username: tmp,
        email: tmp + "@randomstudent.fr"
      }

      this.userService.add(newUser)
    }
    const test = await this.userService.findByUsername(tmp)


    const payload = { username: tmp, auth: false };
		const accessToken = await this.jwtService.signAsync(payload);
		res.cookie('jwt', accessToken, {httpOnly: true})
  }


  @Get('/auth/42/callback')
  @UseGuards(FortyTwoAuthGuard)
  async FortyTwoAuthRedirect(@Req() req, @Res({passthrough: true}) res) {
    if (!req.user['username']) {
      res.redirect(process.env.VUE_APP_ENDPOINT + 'authmodal');
      return ;
    }
    const payload = { username: req.user['username'], auth: false };
		const accessToken = await this.jwtService.signAsync(payload);
    if (req.user.status === 'Offline')
      req.user.status = 'Online';
		res.cookie('jwt', accessToken, {httpOnly: true})
		res.redirect( process.env.VUE_APP_ENDPOINT + 'home');
  }

  @UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('userinfo')
  async userinfo(@Req() req) {
    try {
    const user = await this.userService.findByUsername(req.user.username);

    if (!user)
      throw new UnauthorizedException("Not authorized")

		return user;
	  } catch (e) {
		  throw e;
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
    const isCodeValid = this.twoFAService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode.twoFactorAuthenticationCode, req.user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.userService.turnOnTwoFactorAuthentication(req.user.id);
  }

  @Post('/twofa/turn-off')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, TwoFAAuth)
  async turnOffTwoFactorAuthentication(
    @Req() req,
    @Res({passthrough: true}) res,
    @Body() twoFactorAuthenticationCode) {
    const user: User = req.user;
    const isCodeValid = this.twoFAService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode.twoFactorAuthenticationCodeTwo, req.user
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.userService.turnOffTwoFactorAuthentication(req.user.id);
  
    const payload = { username: req.user['username'], auth: false };
		const accessToken = await this.jwtService.signAsync(payload);
		res.clearCookie('jwt');
    res.cookie('jwt', accessToken, {httpOnly: true})
		// res.redirect('http://localhost:3001/home');
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('/twofa/authenticate')
  @HttpCode(200)
  async twoFAAuthenticate(
    @Req() req,
    @Res({passthrough: true}) res,
    @Body() twoFactorAuthenticationCode) {
    const user: User = req.user;

    const isCodeValid = this.twoFAService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode.twoFactorAuthenticationCode, req.user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    const payload = { username: req.user['username'], auth: true };
		const accessToken = await this.jwtService.signAsync(payload);
		// res.clearCookie('jwt');
    
    res.cookie('jwt', accessToken, {httpOnly: true})
    // console.log('check accessToken ', accessToken)
		// res.redirect('http://localhost:3001/home');
  }

  @UseGuards(JwtAuthGuard)
  @Get('/twofa/check')
  async checkAuthentication(@Req()req) {
    const user: User = req.user;
    const decode = this.jwtService.decode(req.cookies.jwt);

    // console.log('check auth ', decode['auth'])

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
