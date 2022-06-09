import { forwardRef, Module } from '@nestjs/common';
import { PongService } from './pong.service';
import { PongGateway } from './pong.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './models/match.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]),
    forwardRef(() => UserModule)
],
  providers: [
    PongGateway,
    PongService,
  ],
  exports: [PongGateway, PongService]
})

export class PongModule { }
