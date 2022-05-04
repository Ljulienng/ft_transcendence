"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("../models/message.entity");
const user_service_1 = require("../../user/service/user.service");
const channel_service_1 = require("../../channel/service/channel.service");
let MessageService = class MessageService {
    constructor(messageRepository, userService, channelService) {
        this.messageRepository = messageRepository;
        this.userService = userService;
        this.channelService = channelService;
    }
    async findAll() {
        return await this.messageRepository.find();
    }
    async findMessageById(messageId) {
        return await this.messageRepository.findOneOrFail({
            where: { id: Number(messageId) }
        });
    }
    async saveMessage(message, channelId) {
        const currentChannel = await this.channelService.findChannelById(channelId);
        console.log('[saveMessage] channel ', channelId, ' : ', currentChannel);
        return await this.messageRepository.save({
            content: message,
            channel: currentChannel,
        });
    }
    async delete(messageId) {
        const message = await this.findMessageById(messageId);
        if (!message) {
            throw new common_1.NotFoundException();
        }
        return await this.messageRepository.remove(message);
    }
};
MessageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        user_service_1.UserService,
        channel_service_1.ChannelService])
], MessageService);
exports.MessageService = MessageService;
//# sourceMappingURL=message.service.js.map