import { Request } from "express"
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { Strategy, ExtractJwt } from "passport-jwt"
// import {} from "@nestjs/jwt"
// import { Strategy } from 
import { PassportStrategy } from "@nestjs/passport"
import { UserService } from "src/user/service/user.service"
import { User } from "src/user/models/user.entity"
import { UserJwtPayload } from "../interfaces/jwt-payload.interface"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor ( private userService: UserService ) {
		super({
			secretOrKey: 'SECRET',
			ignoreExpiration: false,
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					let token = request?.cookies["jwt"];

					if (!token)
					 throw new UnauthorizedException('Invalid token');

					return token;
				}
			])
		})
	}

	async validate(payload: any): Promise<User> {
		// console.log('jwt validate');
		const { username, auth } = payload;
		const user = await this.userService.findByUsername(username); // to change
		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		return user
	}
}