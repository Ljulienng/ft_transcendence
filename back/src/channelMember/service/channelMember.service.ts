import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "src/channel/models/channel.entity";
import { User } from "src/user/models/user.entity";
import { Repository } from "typeorm";
import { UpdateMemberChannelDto } from "../models/channelMember.dto";
import { ChannelMember } from "../models/channelMember.entity";

@Injectable()
export class ChannelMemberService {
    constructor(
        @InjectRepository(ChannelMember)
        private channelMemberRepository: Repository<ChannelMember>,
    ) {}
   
    async findOne(user: User, channel: Channel) {
        return await this.channelMemberRepository.findOne({
            user: user,
            channel: channel,
        })
    }

    async createMember(user: User, channel: Channel, admin: boolean) {
        const newMember = this.channelMemberRepository.create({
            admin: admin,
            user: user,
            channel: channel,
        });
        await this.channelMemberRepository.save(newMember);
    }

    /*
    ** updade admin, muted or banned options of a member
    ** if the member is muted or banned, we set a period from which it will no longer be 
    */
    async updateMember(user: User, channel: Channel, updates: UpdateMemberChannelDto) {
        const member = await this.findOne(user, channel);
        const muteOrBanTime = 1000 * 60;  // arbitrary time [1000 = 1 second]
        console.log(updates);
        
        for (const update in updates) {
            member[update] = updates[update];
        }

        if (member.muted == false)
            member.mutedEnd = null;
        if (member.banned == false)
            member.bannedEnd = null;
        
        if (updates.muted == true)
            member.mutedEnd = new Date(Date.now() + muteOrBanTime);
        if (updates.banned == true)
            member.bannedEnd = new Date(Date.now() + muteOrBanTime);
        
        await this.channelMemberRepository.save(member);
    }

    async deleteMember(user: User, channel: Channel) {
        const memberToRemove = await this.findOne(user, channel);
        await this.channelMemberRepository.delete(memberToRemove);
    }
}