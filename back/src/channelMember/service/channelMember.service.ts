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
        
    }
}