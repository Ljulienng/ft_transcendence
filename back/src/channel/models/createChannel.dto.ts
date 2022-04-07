import { IsIn, IsOptional, IsNotEmpty, IsString } from 'class-validator';

export class CreateChannelDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(["private", "protected", "public"])
    type: string;

    @IsOptional()
    @IsString()
    password: string;
}
