import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  fortyTwoLogin(req) {
    if (!req.user){
      return 'No user from 42'
    }
    return {
      message: 'User info from 42',
      user: req.user
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
