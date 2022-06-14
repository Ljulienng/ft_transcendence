import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "src/channel/models/channel.entity";
import { User } from "src/user/models/user.entity";
import { LessThan, Repository } from "typeorm";
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

    async findAllBannedMembersToUnban() {
        return await this.channelMemberRepository.find({
            where: {
                banned: true,
                bannedEnd: LessThan(new Date()),
            },
        });
    }

    async findAllMutedMembersToUnmute() {
        return await this.channelMemberRepository.find({
            where: {
                muted: true,
                mutedEnd: LessThan(new Date()),
            },
        });
    }

    async findMutedAndBanned(channel: Channel) {
        return await this.channelMemberRepository.find({
            where: 
            [
                { 
                    channel: channel,
                    muted: true
                },
                { 
                    channel: channel,
                    banned: true 
                }
            ]
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
   
            if (!memberToUpdate.banned)
                memberToUpdate.bannedEnd = null;
            if (!memberToUpdate.muted)
                memberToUpdate.mutedEnd = null;
            
            if (memberToUpdate.banned && updates.timeToBan)
                memberToUpdate.bannedEnd = new Date(Date.now() + updates.timeToBan * 60000)
            if (memberToUpdate.muted && updates.timeToMute)
                memberToUpdate.mutedEnd = new Date(Date.now() + updates.timeToMute * 60000)

            await this.channelMemberRepository.save(memberToUpdate);
        }
    }

    async checkBanMuteTime() {
        // console.log("interval check mute/ban time ...");
        const banMembers= await this.findAllBannedMembersToUnban();
        banMembers.forEach(member => {
            // console.log("unban : ", member.id, member.banned, member.bannedEnd);
            member.banned = false;
            member.bannedEnd = null;
        });
        await this.channelMemberRepository.save(banMembers);

        const muteMembers = await this.findAllMutedMembersToUnmute();
        muteMembers.forEach(member => {
            // console.log("unmute : ", member.id, member.muted, member.mutedEnd);
            member.muted = false;
            member.mutedEnd = null;
        });
        await this.channelMemberRepository.save(muteMembers);
        console.log(`Unbanned ${banMembers.length} member(s) and Unmuted ${muteMembers.length} member(s)`);
    }

    async deleteMember(userToRemove: User, channel: Channel) {
        const memberToRemove = await this.findOne(userToRemove, channel);
        await this.channelMemberRepository.remove(memberToRemove);
    }
}