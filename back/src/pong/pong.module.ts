import { Module } from '@nestjs/common';
import { PongController } from './pong.controller';
import { PongService } from './pong.service';
import { PongGateway } from './pong.gateway';

@Module({
	controllers: [PongController],
	providers: [PongGateway, PongService],
	exports: [PongGateway, PongService]
})
export class PongModule {}
