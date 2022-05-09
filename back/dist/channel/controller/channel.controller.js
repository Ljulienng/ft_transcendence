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
exports.ChannelController = void 0;
const common_1 = require("@nestjs/common");
const channel_service_1 = require("../service/channel.service");
const createChannel_dto_1 = require("../models/createChannel.dto");
const message_service_1 = require("../../message/service/message.service");
let ChannelController = class ChannelController {
    constructor(channelService, messageService) {
        this.channelService = channelService;
        this.messageService = messageService;
    }
    findAll() {
        return this.channelService.findAll();
    }
    findChannelById(channelId) {
        return this.channelService.findChannelById(channelId);
    }
    findChannelByName(name) {
        return this.channelService.findChannelByName(name);
    }
    async findMessagesByChannelId(channelId) {
        const channel = await this.channelService.findChannelById(channelId);
        return this.channelService.getChannelMessagesByRoomId(channel.id);
    }
    createChannel(request, channelDto) {
        return this.channelService.createChannel(channelDto, 1);
    }
    changePassword(channelId, request, passwords) {
        return this.channelService.changePassword(channelId, 1, passwords);
    }
    deleteChannel(channelId) {
        return this.channelService.deleteChannel(channelId);
    }
};
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':channelId'),
    __param(0, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "findChannelById", null);
__decorate([
    (0, common_1.Get)(':name'),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "findChannelByName", null);
__decorate([
    (0, common_1.Get)(':channelId/messages'),
    __param(0, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "findMessagesByChannelId", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, createChannel_dto_1.CreateChannelDto]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "createChannel", null);
__decorate([
    (0, common_1.Post)(':channelId/changePass'),
    __param(0, (0, common_1.Param)('channelId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Delete)(':channelId'),
    __param(0, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "deleteChannel", null);
ChannelController = __decorate([
    (0, common_1.Controller)('channel'),
    __metadata("design:paramtypes", [channel_service_1.ChannelService,
        message_service_1.MessageService])
], ChannelController);
exports.ChannelController = ChannelController;
//# sourceMappingURL=channel.controller.js.map