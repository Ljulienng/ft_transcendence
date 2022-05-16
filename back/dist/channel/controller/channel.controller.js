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
const channel_dto_1 = require("../models/channel.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const channelMember_dto_1 = require("../../channelMember/models/channelMember.dto");
let ChannelController = class ChannelController {
    constructor(channelService) {
        this.channelService = channelService;
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
    async createChannel(request, channelDto) {
        await this.channelService.createChannel(channelDto, request.user.id);
    }
    changePassword(channelId, request, passwords) {
        return this.channelService.changePassword(channelId, request.user.id, passwords);
    }
    async updateMemberChannel(request, userId, channelId, updates) {
        return await this.channelService.updateChannelMember(request.user.id, userId, channelId, updates);
    }
    async deleteChannel(channelId) {
        return await this.channelService.deleteChannel(channelId);
    }
    async deleteChannelMember(userId, channelId) {
        return await this.channelService.deleteChannelMember(userId, channelId);
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
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, channel_dto_1.CreateChannelDto]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "createChannel", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':channelId/changePass'),
    __param(0, (0, common_1.Param)('channelId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "changePassword", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':channelId/:userId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Param)('channelId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, channelMember_dto_1.UpdateMemberChannelDto]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "updateMemberChannel", null);
__decorate([
    (0, common_1.Delete)(':channelId'),
    __param(0, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "deleteChannel", null);
__decorate([
    (0, common_1.Delete)(':channelId/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "deleteChannelMember", null);
ChannelController = __decorate([
    (0, common_1.Controller)('channel'),
    __metadata("design:paramtypes", [channel_service_1.ChannelService])
], ChannelController);
exports.ChannelController = ChannelController;
//# sourceMappingURL=channel.controller.js.map