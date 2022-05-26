import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { MessageChannel } from "src/message/models/messageChannel.entity";
import { Channel } from "src/channel/models/channel.entity";


// class transformer
export class UserDto {
	
	id: number;

	// @Isoptional() decorators for tests
	@IsOptional()
	firstname: string;

	@IsOptional()
	lastname: string;

	@IsString()
	username: string;

	@IsString()
	email: string;

	@IsOptional()
	admin: boolean;

	@IsOptional()
	banned: boolean;

	@IsOptional()
	twoFASecret: string

	@IsBoolean()
	twoFAEnabled: boolean

	@IsOptional()
	createdTime: Date

	@IsOptional()
	messages: MessageChannel[];

	@IsOptional()
	channels: Channel[];

	@IsOptional()
	status: string;

	@IsOptional()
	string: number[];

	@IsOptional()
	profileImage? : string;

}