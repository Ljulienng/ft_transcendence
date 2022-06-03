import { Module } from '@nestjs/common';
import { PongService } from './pong.service';
import { PongGateway } from './pong.gateway';
import { UserService } from 'src/user/service/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './models/game.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Game]),
	],
	providers: [
		PongGateway,
		PongService
	],
	exports: [PongGateway, PongService]
})
export class PongModule {}
