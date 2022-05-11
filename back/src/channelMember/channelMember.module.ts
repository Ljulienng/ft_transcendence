import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelMember } from './models/channelMember.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ChannelMember])],
})
export class ChannelMemberModule {}
