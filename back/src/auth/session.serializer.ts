import { PassportSerializer } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { User } from "src/user/models/user.entity";

@Injectable()
export class SessionSerializer extends PassportSerializer {
	serializeUser(user: any, done: (err: Error, User: any) => void): any {
		done(null, User)
	}

	deserializeUser(payload: any, done: (err: Error, payload: string) => void): any {
		done(null, payload);
	}
}