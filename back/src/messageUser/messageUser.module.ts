import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageUserController } from './controller/messageUser.controller';
import { MessageUser } from './models/messageUser.entity';
import { MessageUserService } from './service/messageUser.service';
import { UserModule } from 'src/user/user.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([MessageUser]),
],
  controllers: [MessageUserController],
  providers: [MessageUserService],
  exports: [MessageUserService], 
})
export class MessageUserModule {}
