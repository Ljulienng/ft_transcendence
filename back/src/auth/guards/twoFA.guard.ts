import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PassportModule } from "@nestjs/passport";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TwoFAAuthGuard extends AuthGuard('twofa') {}