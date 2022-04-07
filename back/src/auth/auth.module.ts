import { Module, forwardRef } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "src/user/user.module";
import { FortyTwoService } from "./fortytwo.service";
import { FortyTwoStrategy } from "./strategy/fortytwo.strategy";
import { SessionSerializer } from "./session.serializer";
import { UserService } from "src/user/service/user.service";
import { User } from "src/user/models/user.entity";

@Module({
	imports: [ forwardRef(() => UserModule), PassportModule.register({ session :true })],
	providers: [
		FortyTwoStrategy,
		FortyTwoService,
		SessionSerializer
	],
})
export class AuthModule {}