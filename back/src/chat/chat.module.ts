import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChannelModule } from 'src/channel/channel.module';
import { ChannelService } from 'src/channel/service/channel.service';

@Module({
    imports: [ChannelModule],
    providers: [ChatGateway],
})
export class ChatModule {}
