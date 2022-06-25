import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageUserController } from './controller/messageUser.controller';
import { MessageUser } from './models/messageUser.entity';
import { MessageUserService } from './service/messageUser.service';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([MessageUser]),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),

    
],
  controllers: [MessageUserController],
  providers: [MessageUserService],
  exports: [MessageUserService], 
})
export class MessageUserModule {}
