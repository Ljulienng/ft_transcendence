 import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
 import { Strategy, VerifyCallback } from 'passport-42'
import { User } from "src/user/models/user.entity"
import { FortyTwoService } from "../fortytwo.service"

 @Injectable()

 export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
	 constructor(private readonly fortyTwoService: FortyTwoService) {
		 super ({
			 clientID: '6e9899c0ea140e9e95b0ea737b6e2564ec8f73668d03408f5c8dbc5d9204ee3e',
			 clientSecret: "fea160a91c590b4e2edd01a70ba84efc21e5dffbaad950d556cceecd8854f6c1",
			 callbackURL: "http://localhost:3000/auth/42/callback",
			 scope: ['public']
			})
	 }

	 async validate(accessToken: string, refreshToken: string, profile: any, cb: VerifyCallback): Promise<User> {
		const { name } = profile
		const userIdentity =  {
			username: name['givenName'],
			email: profile['emails'][0]['value'],

		}
		console.log(userIdentity);
		return this.FortyTwoService.validateUser(userIdentity);
	 }
 }
