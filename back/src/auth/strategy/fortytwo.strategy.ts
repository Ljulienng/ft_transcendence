import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy, VerifyCallback } from 'passport-42'
import { config } from "process"
import { User } from "src/user/models/user.entity"
import { FortyTwoService } from "../fortytwo.service"

 @Injectable()

 export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
	 constructor(private readonly fortyTwoService: FortyTwoService, private configService: ConfigService) {
		 super ({
			 clientID: configService.get('42CLIENTID'),
			 clientSecret: configService.get('42CLIENTSECRET'),
			 callbackURL: "http://localhost:3000/auth/42/callback",
			 scope: ['public']
			})
	 }

	 async validate(accessToken: string, refreshToken: string, profile: any, cb: VerifyCallback): Promise<User> {
		const { name } = profile
		console.log("userinfotest ");

		const userIdentity =  {
			username: profile['username'],
			firstname: name['givenName'],
			lastname: name['familyName'],
			email: profile['emails'][0]['value'],

		}


		return this.fortyTwoService.validateUser(userIdentity);
	}
 }
