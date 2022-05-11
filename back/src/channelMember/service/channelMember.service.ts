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

    }

    async unmuteMember(user: User, channel: Channel) {

    }

    async banMember(user: User, channel: Channel) {

    }

    async unbanMember(user: User, channel: Channel) {

    }

    async removeMember(user: User, channel: Channel) {
        const memberToRemove = await this.findOne(user, channel);
        await this.channelMemberRepository.delete(memberToRemove);
    }
}