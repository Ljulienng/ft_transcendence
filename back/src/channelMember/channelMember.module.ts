import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelMember } from './models/channelMember.entity';
import { ChannelMemberService } from './service/channelMember.service';

@Module({
    imports: [TypeOrmModule.forFeature([ChannelMember])],
    providers: [ChannelMemberService],
    exports: [ChannelMemberService],
})
export class ChannelMemberModule {}
