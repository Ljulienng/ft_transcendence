import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean } from "class-validator";

export class CreateMemberChannelDto {
    admin: boolean;
	muted: boolean; 
	mutedEnd: Date;
    banned: boolean;
	bannedEnd: Date;
}

export class UpdateMemberChannelDto extends PartialType(CreateMemberChannelDto) {
    channelId?: number;
    username?: string;
}