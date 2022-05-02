import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, VerifyCallback } from 'passport-42'
import { User } from "src/user/models/user.entity"
import { FortyTwoService } from "../fortytwo.service"

 @Injectable()

 export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
	 constructor(private readonly fortyTwoService: FortyTwoService) {
		 super ({
			 clientID: 'f1490b0f47fb066ee9ec67fb3c14bfa541ac78a9ef44cb6558d59496e1095d08',
			 clientSecret: "09974f3620e45c8fdf0dc194ba3262ba189b594ec9f0534261f02e8a0261a716",
			 callbackURL: "http://localhost:3000/auth/42/callback",
			 scope: ['public']
			})
	 }

	 async validate(accessToken: string, refreshToken: string, profile: any, cb: VerifyCallback): Promise<User> {
		const { name } = profile
		// console.log("userinfo: ",profile);

		const userIdentity =  {
			username: profile['username'],
			firstname: name['givenName'],
			lastname: name['familyName'],
			email: profile['emails'][0]['value'],

		}
		// console.log("VALIDATE: ", userIdentity);
		return this.fortyTwoService.validateUser(userIdentity);
	 }
 }
