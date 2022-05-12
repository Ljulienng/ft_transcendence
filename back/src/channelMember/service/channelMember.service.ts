import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "src/channel/models/channel.entity";
import { User } from "src/user/models/user.entity";
import { Repository } from "typeorm";
import { ChannelMember } from "../models/channelMember.entity";

@Injectable()
export class ChannelMemberService {
    constructor(
        @InjectRepository(ChannelMember)
        private channelMemberRepository: Repository<ChannelMember>,
    ) {}
   
    async findOne(user: User, channel: Channel) {
        return await this.channelMemberRepository.findOne({
            member: user,
            channel: channel,
        })
    }

    async createMember(user: User, channel: Channel, admin: boolean) {
        const newMember = this.channelMemberRepository.create({
            admin: admin,
            member: user,
            channel: channel,
        });
        await this.channelMemberRepository.save(newMember);
    }

    async muteMember(user: User, channel: Channel) {
        const member = await this.findOne(user, channel);
        const muteTime = 1000 * 60;  // arbitrary time [1000 = 1 second]

        member.muted = true;
        member.mutedEnd = new Date(Date.now() + muteTime);
        await this.channelMemberRepository.save(member); 
    }

    async unmuteMember(user: User, channel: Channel) {
        const member = await this.findOne(user, channel);
        member.muted = false;
        member.mutedEnd = null;
        await this.channelMemberRepository.save(member); 
    }

    async banMember(user: User, channel: Channel) {
        const member = await this.findOne(user, channel);
        const banTime = 1000 * 60;  // arbitrary time [1000 = 1 second]

        member.banned = true;
        member.bannedEnd = new Date(Date.now() + banTime);
        await this.channelMemberRepository.save(member); 
    }

    async unbanMember(user: User, channel: Channel) {
        const member = await this.findOne(user, channel);
        member.banned = false;
        member.bannedEnd = null;
        await this.channelMemberRepository.save(member); 
    }

    async deleteMember(user: User, channel: Channel) {
        const memberToRemove = await this.findOne(user, channel);
        await this.channelMemberRepository.delete(memberToRemove);
    }
}