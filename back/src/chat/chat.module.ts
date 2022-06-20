import { forwardRef, Module } from '@nestjs/common';
// import { ChatGateway } from './chat.gateway';
import { ChannelModule } from 'src/channel/channel.module';
import { MessageModule } from 'src/message/message.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        forwardRef(() => ChannelModule), 
        forwardRef(() => MessageModule),
        forwardRef(() => UserModule),
        forwardRef(() => AuthModule),
    ],
    providers: [], 
})
export class ChatModule {}
