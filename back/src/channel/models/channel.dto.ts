import { IsOptional, IsNotEmpty, IsString, IsEnum, IsIn } from 'class-validator';

export class CreateChannelDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    type: string;

    @IsOptional()
    @IsString()
    password: string;
}

export class JoinChannelDto {
    @IsNotEmpty()
    id: number;

    @IsOptional()
    @IsString()
    type: string;

    @IsOptional()
    @IsString()
    password: string;
}

export class changePasswordDto {
    old: string;
    new: string;
    channelId: number;
}

export class updateChannelDto {
    @IsOptional()
    name: string;

    @IsOptional()
    @IsIn(["public", "protected", "private"])
    type: string;
    
    channelId: number;
}

export class channelInvitationDto {
    channelId: number;
    guest: string;
}

export class updateMemberDto {
    channelId: number;
    username: string;
}