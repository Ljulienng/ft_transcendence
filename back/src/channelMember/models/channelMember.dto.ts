import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean } from "class-validator";

export class CreateMemberChannelDto {
	@IsBoolean()
    admin: boolean;

    @IsBoolean()
	muted: boolean;

	mutedEnd: Date;

    @IsBoolean()
    banned: boolean;

	bannedEnd: Date;
}

export class UpdateMemberChannelDto extends PartialType(CreateMemberChannelDto) {}