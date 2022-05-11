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

    async addOne(user: User, channel: Channel, admin: boolean) {
        const newMember = new ChannelMember();
        newMember.admin = admin;
        newMember.member = user;
        newMember.channel = channel;
        await this.channelMemberRepository.save(newMember);
    }
}