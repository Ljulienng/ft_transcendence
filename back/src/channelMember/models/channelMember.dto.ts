import { PartialType } from "@nestjs/mapped-types";

export class CreateMemberChannelDto {

}

export class UpdateMemberChannelDto extends PartialType(CreateMemberChannelDto) {}