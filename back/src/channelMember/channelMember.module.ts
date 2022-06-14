import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelMember } from './models/channelMember.entity';
import { ChannelMemberService } from './service/channelMember.service';
import { TaskService } from './service/task.service';

@Module({
    imports: [TypeOrmModule.forFeature([ChannelMember])],
    providers: [ChannelMemberService, TaskService],
    exports: [ChannelMemberService, TaskService],
})
export class ChannelMemberModule {}
