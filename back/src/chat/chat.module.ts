import { forwardRef, Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChannelModule } from 'src/channel/channel.module';

@Module({
    imports: [
        forwardRef(() => ChannelModule),
    ],
    providers: [ChatGateway],
})
export class ChatModule {}
