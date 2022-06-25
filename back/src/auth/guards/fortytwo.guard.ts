import { ConsoleLogger, ExecutionContext, HttpException, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class FortyTwoAuthGuard extends AuthGuard('42') {

	constructor() {
		super();
	}
	handleRequest(err: any, user: any, info: any, context: any, status: any) {
		// console.log('errorGuard', err);
		return user;
	  }
} 