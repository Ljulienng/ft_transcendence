import { Module, forwardRef } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "src/user/user.module";
import { FortyTwoService } from "./fortytwo.service";
import { FortyTwoStrategy } from "./strategy/fortytwo.strategy";
import { JwtModule } from "@nestjs/jwt"
import { AuthController } from './auth.controller'
import { JwtStrategy } from "./strategy/jwt.strategy";

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.register({
			secret: 'SECRET',
			signOptions: {expiresIn: '1d'}
		}),
		UserModule,
	],
	controllers: [AuthController],
	providers: [
		FortyTwoStrategy,
		JwtStrategy,
		FortyTwoService,
	],
	exports: [
		JwtModule,
		PassportModule
	]
})
export class AuthModule {}