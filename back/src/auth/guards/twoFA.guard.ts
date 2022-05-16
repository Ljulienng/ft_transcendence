import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UserService } from "src/user/service/user.service";
import { User } from "src/user/models/user.entity";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class TwoFAAuth implements CanActivate {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,

	) {}

	canActivate(context: ExecutionContext): boolean {
		const req = context.switchToHttp().getRequest();
		const user: User = req.user;

		if (!user)
			throw new ForbiddenException('User doesn\'t exist')

		const decode = this.jwtService.decode(req.cookies.jwt)
		console.log("DECODED JWT = ", decode)
		if (decode['auth'] === false && user.twoFAEnabled === true)
			throw new ForbiddenException('User need to authenticate')

		return true;
	}
}