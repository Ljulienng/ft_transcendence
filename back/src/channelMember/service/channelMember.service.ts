import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
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
   
    async findOne(user: User, channel: Channel): Promise<ChannelMember> {
        return await this.channelMemberRepository.findOne({
            where: {
                user: user,
                channel: channel,
            },
        })
    }

    async findAllBannedMembers() {
        return await this.channelMemberRepository.find({
            where: {
                banned: true,
            },
        });
    }

    async findAllMutedMembers() {
        return await this.channelMemberRepository.find({
            where: {
                muted: true,
            },
        });
    } 

    async findMembers(channel: Channel) {
        return await this.channelMemberRepository.find({
            where: {
                channel: channel,
            },
        })
    }

    async   findOwner(channel: Channel) {
        return await this.channelMemberRepository.findOne({
            where: {
                channel: channel,
                owner: true,
            },
        })
    }

    async   findAdmins(channel: Channel) {
        return await this.channelMemberRepository.find({
            where: {
                channel: channel,
                admin: true,
            },
        })
    }

    async findChannelsByUser(user: User) {
        return await this.channelMemberRepository.find({
            where: {
                user: user,
            }
        })
    }

    async createMember(user: User, channel: Channel, owner: boolean, admin: boolean) {
        const newMember = this.channelMemberRepository.create({
            channelId: channel.id,
            owner: owner,
            admin: admin,
            user: user,
            channel: channel,
        });
        // console.log('newMember : ', newMember);
        await this.channelMemberRepository.save(newMember);
    }

    /*
    ** to update a member :
    **      - need to be an admin
    **      - need to be the owner if you want to set a member as admin
    */
    updateAllowed(member: ChannelMember, memberToUpdate: ChannelMember, channel: Channel, updates: UpdateMemberChannelDto): boolean {
        if (!member || !memberToUpdate) {
            return false;
        }
        if (!member.admin) {
            return false;
        }
        return true;
    }

    /*
    ** updade admin, muted or banned options of a member
    ** if the member is muted or banned, we set a period from which it will no longer be 
    */
    async updateMember(userWhoUpdate: User, userToUpdate: User, channel: Channel, updates: UpdateMemberChannelDto) {
        const memberWhoUpdate = await this.findOne(userWhoUpdate, channel);
        const memberToUpdate = await this.findOne(userToUpdate, channel);
        
        if (!this.updateAllowed(memberWhoUpdate, memberToUpdate, channel, updates)) {
            throw new HttpException('you can\'t update this channel member', HttpStatus.FORBIDDEN);
        }
        else {
            for (const update in updates) {
                memberToUpdate[update] = updates[update];
            }
            
            if (memberToUpdate.banned || memberToUpdate.muted) {
                console.log("muted until : ", memberToUpdate.mutedEnd);
                this.checkBanMuteTime();
            }
                      
            if (!memberToUpdate.banned)
                memberToUpdate.bannedEnd = null;
            if (!memberToUpdate.muted)
                memberToUpdate.mutedEnd = null;
            
            if (updates.timeToBan)
                memberToUpdate.bannedEnd = new Date(Date.now() + updates.timeToBan * 60000)
            if (updates.timeToMute)
                memberToUpdate.mutedEnd = new Date(Date.now() + updates.timeToMute * 60000)

            await this.channelMemberRepository.save(memberToUpdate);
        }
    }

    @Interval(60000)
    async checkBanMuteTime() {
        // console.log("interval ...");
        const banMembers= await this.findAllBannedMembers();
        for(const member of banMembers) {
            if (member.bannedEnd && member.bannedEnd.getTime() < Date.now()) {
                await this.channelMemberRepository.update(member.id, { banned: false, bannedEnd: null });
            }
        };
        const muteMembers = await this.findAllMutedMembers();
        for(const member of muteMembers) {
            // console.log("muted member : ", member.id, member.mutedEnd.getTime(), Date.now());
            if (member.mutedEnd && member.mutedEnd.getTime() < Date.now()) {
                console.log("unmute : ", member.id, member.muted, member.mutedEnd);
                await this.channelMemberRepository.update(member.id, { muted: false, mutedEnd: null });
                console.log("unmute ok : ", member.id, member.muted, member.mutedEnd);
            }
        };
        
    }

    async deleteMember(userToRemove: User, channel: Channel) {
        const memberToRemove = await this.findOne(userToRemove, channel);
        await this.channelMemberRepository.remove(memberToRemove);
    }
}