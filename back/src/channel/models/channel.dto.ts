import { IsOptional, IsNotEmpty, IsString, IsEnum } from 'class-validator';

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

export class channelInvitationDto {
    channelId: number;
    guest: string;
}

export class upgradeMemberDto {
    channelId: number;
    username: string;
}