import { forwardRef, Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChannelModule } from 'src/channel/channel.module';
import { MessageModule } from 'src/message/message.module';

@Module({
    imports: [
        forwardRef(() => ChannelModule), 
        forwardRef(() => MessageModule),
    ],
    providers: [ChatGateway], 
})
export class ChatModule {}
