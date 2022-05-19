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
exports.ChannelService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const channel_entity_1 = require("../models/channel.entity");
const message_service_1 = require("../../message/service/message.service");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../user/models/user.entity");
const channelMember_service_1 = require("../../channelMember/service/channelMember.service");
const user_service_1 = require("../../user/service/user.service");
let ChannelService = class ChannelService {
    constructor(channelRepository, userRepository, userService, channelMemberService, messageService) {
        this.channelRepository = channelRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.channelMemberService = channelMemberService;
        this.messageService = messageService;
    }
    async findAll() {
        return (await this.channelRepository.find()).sort((a, b) => b.createdTime.getTime() - a.createdTime.getTime());
    }
    async findChannelById(channelId) {
        return await this.channelRepository.findOne({
            id: channelId
        });
    }
    async findChannelByName(channelName) {
        return await this.channelRepository.findOne({
            name: channelName
        });
    }
    async findMembers(channelId) {
        const channel = await this.findChannelById(channelId);
        return await this.channelMemberService.findMembers(channel);
    }
    async findOwner(channelId) {
        const channel = await this.findChannelById(channelId);
        return await this.channelMemberService.findOwner(channel);
    }
    async createChannel(createChannel, userId) {
        const user = await this.userRepository.findOne({ id: userId });
        if (!user) {
            throw new common_1.UnauthorizedException('user does not exist');
        }
        const isSameChatName = await this.channelRepository.findOne({ name: createChannel.name });
        if (isSameChatName) {
            throw new common_1.UnauthorizedException('this name is already used');
        }
        const newChannel = this.channelRepository.create({
            name: createChannel.name,
            type: createChannel.type,
            password: createChannel.password,
            messages: [],
            channelMembers: [],
            user: user,
        });
        if (newChannel.type === channel_entity_1.ChannelType.protected || newChannel.type === channel_entity_1.ChannelType.private) {
            if (!newChannel.password) {
                throw new common_1.BadRequestException('need a password for private or protected channel');
            }
            if (newChannel.password.length < 8) {
                throw new common_1.HttpException('password too short', common_1.HttpStatus.FORBIDDEN);
            }
            const saltOrRounds = await bcrypt.genSalt();
            newChannel.password = await bcrypt.hash(newChannel.password, saltOrRounds);
        }
        console.log('new channel created : ', newChannel);
        await this.channelRepository.save(newChannel);
        await this.channelMemberService.createMember(user, newChannel, true, true);
    }
    async createDmChannel(createChannel, user1Id, user2Id) {
        const user1 = await this.userRepository.findOne({ id: user1Id });
        const user2 = await this.userRepository.findOne({ id: user2Id });
        if (!user1 || !user2) {
            throw new common_1.UnauthorizedException('user does not exist');
        }
        const isSameChatName = await this.channelRepository.findOne({ name: createChannel.name });
        if (isSameChatName) {
            throw new common_1.UnauthorizedException('this name is already used');
        }
        const newChannel = this.channelRepository.create({
            name: createChannel.name,
            type: channel_entity_1.ChannelType.private,
            messages: [],
            channelMembers: [],
            user: user1,
        });
        console.log('new DM channel created : ', newChannel);
        await this.channelRepository.save(newChannel);
        await this.channelMemberService.createMember(user1, newChannel, true, true);
        await this.channelMemberService.createMember(user2, newChannel, false, true);
    }
    async checkPasswordMatch(sentPassword, hashExpectedPassword) {
        return await bcrypt.compare(sentPassword, hashExpectedPassword);
    }
    async addUserToChannel(joinChannel, userId) {
        const user = await this.userRepository.findOne({ id: userId });
        const welcomingChannel = await this.findChannelById(joinChannel.id);
        if (welcomingChannel.type !== channel_entity_1.ChannelType.public) {
            if (welcomingChannel.password) {
                const match = this.checkPasswordMatch(welcomingChannel.password, joinChannel.password);
                if (!match) {
                    throw new common_1.UnauthorizedException('incorrect password');
                }
            }
        }
        if (this.channelMemberService.findOne(user, welcomingChannel)) {
            throw new common_1.UnauthorizedException('user already in this channel');
        }
        await this.channelMemberService.createMember(user, welcomingChannel, false, false);
        await this.channelRepository.save(welcomingChannel);
    }
    async removeUserToChannel(leaveChannel, userId) {
        const user = await this.userRepository.findOne({ id: userId });
        const channelToLeave = await this.findChannelById(leaveChannel.id);
        const channelMember = await this.channelMemberService.findOne(user, channelToLeave);
        if (!channelMember) {
            throw new common_1.UnauthorizedException('user not in this channel');
        }
        if (channelMember.owner) {
            await this.channelRepository.delete(channelToLeave);
        }
        else {
            this.channelMemberService.deleteMember(user, channelToLeave);
            await this.channelRepository.save(channelToLeave);
        }
    }
    async changePassword(channelId, userId, passwords) {
        const user = await this.userRepository.findOne({ id: userId });
        const channel = await this.findChannelById(channelId);
        const channelMember = await this.channelMemberService.findOne(user, channel);
        if (!channelMember.owner) {
            throw new common_1.HttpException('you are not authorized to change the password', common_1.HttpStatus.FORBIDDEN);
        }
        if (passwords.newPassword.length < 8) {
            throw new common_1.HttpException('password too short', common_1.HttpStatus.FORBIDDEN);
        }
        if (!(await this.checkPasswordMatch(passwords.oldPassword, channel.password))) {
            throw new common_1.HttpException('current password does not match', common_1.HttpStatus.FORBIDDEN);
        }
        const saltOrRounds = await bcrypt.genSalt();
        const password = await bcrypt.hash(passwords.newPassword, saltOrRounds);
        this.channelRepository.update(channel.id, { password });
    }
    async deleteChannel(userId, channelId) {
        const user = await this.userRepository.findOne({ id: userId });
        const channel = await this.findChannelById(channelId);
        const channelMember = await this.channelMemberService.findOne(user, channel);
        if (!channel) {
            throw new common_1.NotFoundException();
        }
        if (!channelMember.owner) {
            throw new common_1.HttpException('only the owner can delete channels', common_1.HttpStatus.FORBIDDEN);
        }
        return await this.channelRepository.remove(channel);
    }
    async updateChannelMember(userId, memberId, channelId, updates) {
        const userWhoUpdate = await this.userRepository.findOne({ id: userId });
        const userToUpdate = await this.userRepository.findOne({ id: memberId });
        const channel = await this.findChannelById(channelId);
        return await this.channelMemberService.updateMember(userWhoUpdate, userToUpdate, channel, updates);
    }
    async deleteChannelMember(userId, channelId) {
        const user = await this.userRepository.findOne({ id: userId });
        const channel = await this.findChannelById(channelId);
        return await this.channelMemberService.deleteMember(user, channel);
    }
    async getChannelMessagesByChannelName(channelName) {
        const channel = await this.findChannelByName(channelName);
        const messages = await this.messageService.findMessagesByChannel(channel);
        return messages.sort((a, b) => a.createdTime.getTime() - b.createdTime.getTime());
    }
    async getChannelMessagesByChannelId(channelId) {
        const channel = await this.findChannelById(channelId);
        const messages = await this.messageService.findMessagesByChannel(channel);
        return messages.sort((a, b) => a.createdTime.getTime() - b.createdTime.getTime());
    }
    async saveMessage(userId, createMessageDto) {
        const user = await this.userRepository.findOne({ id: userId });
        const channel = await this.findChannelById(createMessageDto.channelId);
        const channelMember = await this.channelMemberService.findOne(user, channel);
        if (!channelMember) {
            throw new common_1.HttpException('this user is not a channel member', common_1.HttpStatus.FORBIDDEN);
        }
        return await this.messageService.saveMessage(user, channel, createMessageDto);
    }
};
ChannelService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(channel_entity_1.Channel)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, common_1.Inject)(user_service_1.UserService)),
    __param(3, (0, common_1.Inject)(channelMember_service_1.ChannelMemberService)),
    __param(4, (0, common_1.Inject)(message_service_1.MessageService)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        user_service_1.UserService,
        channelMember_service_1.ChannelMemberService,
        message_service_1.MessageService])
], ChannelService);
exports.ChannelService = ChannelService;
//# sourceMappingURL=channel.service.js.map