import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelDto } from './createChannel.dto';

// PartialType() returns a class with all properties of the input class set to optional
export class UpdateChannelDto extends PartialType(CreateChannelDto) {}
