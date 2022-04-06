import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport'
import { get } from 'http';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/auth/42')
  @UseGuards(AuthGuard('42'))
  async FortyTwoAuth(@Req() req)  {}

  @Get('/auth/42/callback')
  @UseGuards(AuthGuard('42'))
  FortyTwoAuthRedirect(@Req() req) {
    return this.appService.fortyTwoLogin(req)
  }

  @UseGuards(AuthenticatedGuard)
  @Get('protected')
  getHellow(@Req() req): string {
    return req.user;
  }
}
