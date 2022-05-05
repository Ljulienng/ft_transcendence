import { IsOptional, IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ChannelType } from './channel.entity';

export class JoinChannelDto {

    @IsNotEmpty()
    @IsString()
    id: number;

    @IsOptional()
    @IsString()
    type: ChannelType;

    @IsOptional()
    @IsString()
    password: string;

    // @IsNumber()
    // userId: number;
}
