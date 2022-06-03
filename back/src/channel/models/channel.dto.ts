import { IsOptional, IsNotEmpty, IsString, IsEnum } from 'class-validator';
// import { ChannelType } from './channel.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateChannelDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    // @IsEnum(ChannelType)
    @IsString()
    type: string;

    @IsOptional()
    @IsString()
    password: string;
}


// PartialType() returns a class with all properties of the input class set to optional
export class UpdateChannelDto extends PartialType(CreateChannelDto) {}

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
    @IsNotEmpty()
    channelId: number;

    @IsNotEmpty()
    @IsString()
    guest: string;
}