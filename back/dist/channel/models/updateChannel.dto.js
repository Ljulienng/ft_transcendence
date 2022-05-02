"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateChannelDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const createChannel_dto_1 = require("./createChannel.dto");
class UpdateChannelDto extends (0, mapped_types_1.PartialType)(createChannel_dto_1.CreateChannelDto) {
}
exports.UpdateChannelDto = UpdateChannelDto;
//# sourceMappingURL=updateChannel.dto.js.map