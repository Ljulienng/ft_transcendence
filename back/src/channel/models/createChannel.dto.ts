import { IsOptional, IsNotEmpty, IsString } from 'class-validator';
import { ChannelType } from './channel.entity';

export class CreateChannelDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    type: ChannelType;

    @IsOptional()
    @IsString()
    password: string;
}
