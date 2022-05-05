import { IsOptional, IsString } from 'class-validator';
import { Message } from "src/message/models/message.entity";
import { Channel } from "src/channel/models/channel.entity";

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

	@IsOptional()
	twoFAEnabled: boolean

	@IsOptional()
	createdTime: Date

	@IsOptional()
	messages: Message[];

	@IsOptional()
	channels: Channel[];

	@IsOptional()
	string: number[];

	@IsOptional()
	profileImage? : string;

}