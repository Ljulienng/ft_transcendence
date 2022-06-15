import { Inject, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ChannelMemberService } from "./channelMember.service";

@Injectable()
export class TaskService {
    constructor(
        @Inject(ChannelMemberService)
        private channelMemberService: ChannelMemberService,
    ) {}
    @Cron(CronExpression.EVERY_30_SECONDS)
    handleCron() {
        this.channelMemberService.checkBanMuteTime();
    }
}