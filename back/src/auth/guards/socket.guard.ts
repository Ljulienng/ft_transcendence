
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { UserService } from "src/user/service/user.service";
import { Observable } from "rxjs";
import { User } from "src/user/models/user.entity";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class SocketGuard implements CanActivate {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,

	) {}

	async canActivate(context: any): Promise<boolean> {
	// const req = context.switchToHttp().getRequest();
		const jwtToken = context.args[0].handshake.headers.cookie.split('=')[1]; // getting the token
		const payload = this.jwtService.decode(jwtToken);
		const username = payload["username"];

		// console.log("token = ", this.jwtService.decode(jwtToken))

		
		const user = await this.userService.findByUsername(username);
		
		if (!user)
			throw new ForbiddenException('User doesn\'t exist')
		if (payload['auth'] === false && user.twoFAEnabled === true)
			throw new ForbiddenException('User need to authenticate')
	// const decode = this.jwtService.decode(req.cookies.jwt)
	// // console.log("DECODED JWT = ", decode)
		return true;
}
}
