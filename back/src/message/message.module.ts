import { Module, forwardRef} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './controller/message.controller';
import { MessageChannel } from './models/messageChannel.entity';
import { MessageService } from './service/message.service';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([MessageChannel]),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    

],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService], 
})
export class MessageModule {}
