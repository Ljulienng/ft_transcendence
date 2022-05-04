"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const message_controller_1 = require("./controller/message.controller");
const message_entity_1 = require("./models/message.entity");
const message_service_1 = require("./service/message.service");
const user_module_1 = require("../user/user.module");
const channel_entity_1 = require("../channel/models/channel.entity");
const channel_module_1 = require("../channel/channel.module");
let MessageModule = class MessageModule {
};
MessageModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([message_entity_1.Message]),
            typeorm_1.TypeOrmModule.forFeature([channel_entity_1.Channel]),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            (0, common_1.forwardRef)(() => channel_module_1.ChannelModule),
        ],
        controllers: [message_controller_1.MessageController],
        providers: [message_service_1.MessageService],
        exports: [message_service_1.MessageService],
    })
], MessageModule);
exports.MessageModule = MessageModule;
//# sourceMappingURL=message.module.js.map