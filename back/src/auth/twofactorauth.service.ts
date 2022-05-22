import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { User } from 'src/user/models/user.entity';
import { toFileStream } from 'qrcode';
import { UserService } from 'src/user/service/user.service';
 
@Injectable()
export class TwoFactorAuthenticationService {
  constructor (
    private readonly userService: UserService,
  ) {}
 
  public async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();
 
    const otpauthUrl = authenticator.keyuri(user.email, 'ft_transcendence', secret); // app name to set in .env
 
    await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);

    return {
      secret,
      otpauthUrl
    }
  }

  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }

  public isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User) {
    console.log('isTwoFactorAuthenticationCodeValid = ', twoFactorAuthenticationCode)
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFASecret
    })
  }
}