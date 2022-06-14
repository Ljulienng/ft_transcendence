import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean } from "class-validator";

export class CreateMemberChannelDto {
    admin: boolean;
	muted: boolean; 
	timeToMute: number; // minutes
    banned: boolean;
	timeToBan: number; // minutes
}

export class UpdateMemberChannelDto extends PartialType(CreateMemberChannelDto) {
    channelId?: number;
    username?: string;
}