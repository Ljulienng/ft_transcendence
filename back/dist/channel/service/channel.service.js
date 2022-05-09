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
const message_entity_1 = require("../../message/models/message.entity");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../user/models/user.entity");
let ChannelService = class ChannelService {
    constructor(channelRepository, userRepository, messageRepository) {
        this.channelRepository = channelRepository;
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
    }
    async findAll() {
        return await this.channelRepository.find();
    }
    async findChannelById(channelId) {
        return await this.channelRepository.findOne({ id: channelId });
    }
    async findChannelByName(channelName) {
        return await this.channelRepository.findOne({ name: channelName });
    }
    async createChannel(createChannel, userId) {
        const user = await this.userRepository.findOne({ id: userId });
        if (!user) {
            throw new common_1.UnauthorizedException('user does not exist');
        }
        const newChannel = this.channelRepository.create({
            name: createChannel.name,
            type: createChannel.type,
            password: createChannel.password,
            messages: [],
            owner: user,
            membersId: [userId],
        });
        if (newChannel.type === channel_entity_1.ChannelType.protected || newChannel.type === channel_entity_1.ChannelType.private) {
            if (!newChannel.password) {
                throw new common_1.BadRequestException('need a password for private or protected channel');
            }
            if (newChannel.password.length < 8) {
                throw new common_1.HttpException('password too short', common_1.HttpStatus.FORBIDDEN);
            }
            if (newChannel.password.length > 20) {
                throw new common_1.HttpException('password too long', common_1.HttpStatus.FORBIDDEN);
            }
            const saltOrRounds = await bcrypt.genSalt();
            newChannel.password = await bcrypt.hash(newChannel.password, saltOrRounds);
        }
        console.log('new channel created : ', newChannel);
        return await this.channelRepository.save(newChannel);
    }
    async checkPasswordMatch(sentPassword, expectedPassword) {
        return await bcrypt.compare(sentPassword, expectedPassword);
    }
    async addUserToChannel(joinChannel, userId) {
        const user = await this.userRepository.findOne({ id: userId });
        const welcomingChannel = await this.channelRepository
            .createQueryBuilder('channel')
            .where('channel.id = :channelId', { channelId: joinChannel.id })
            .getOne();
        if (welcomingChannel.type !== channel_entity_1.ChannelType.public) {
            if (welcomingChannel.password) {
                const match = this.checkPasswordMatch(welcomingChannel.password, joinChannel.password);
                if (!match) {
                    throw new common_1.UnauthorizedException('incorrect password');
                }
            }
        }
        if (welcomingChannel.membersId.find(userId => userId === user.id)) {
            throw new common_1.UnauthorizedException('user already in this channel');
        }
        welcomingChannel.membersId.push(user.id);
        await this.channelRepository.save(welcomingChannel);
    }
    async removeUserToChannel(channelSent, userId) {
        const user = await this.userRepository.findOne({ id: userId });
        const channelToLeave = await this.channelRepository
            .createQueryBuilder('channel')
            .where('channel.id = :channelId', { channelId: channelSent.id })
            .getOne();
        await this.channelRepository.save(channelToLeave);
    }
    async changePassword(channelId, userId, passwords) {
        console.log('user:', userId, ' changes password of channel:', channelId, ' [new pass:', passwords.newPassword, ']');
        const user = await this.userRepository.findOne({ id: userId });
        const channel = await this.findChannelById(channelId);
        if (userId !== channel.owner.id) {
            throw new common_1.HttpException('you are not authorized to change the password', common_1.HttpStatus.FORBIDDEN);
        }
        if (passwords.newPassword.length < 8) {
            throw new common_1.HttpException('password too short', common_1.HttpStatus.FORBIDDEN);
        }
        if (passwords.newPassword.length > 20) {
            throw new common_1.HttpException('password too long', common_1.HttpStatus.FORBIDDEN);
        }
        if (!this.checkPasswordMatch(passwords.oldPassword, channel.password)) {
            throw new common_1.HttpException('current password does not match', common_1.HttpStatus.FORBIDDEN);
        }
        const saltOrRounds = await bcrypt.genSalt();
        channel.password = await bcrypt.hash(passwords.newPassword, saltOrRounds);
    }
    async deleteChannel(channelId) {
        const channel = await this.findChannelById(channelId);
        if (!channel) {
            throw new common_1.NotFoundException();
        }
        return this.channelRepository.remove(channel);
    }
    async getChannelMessagesByRoom(room) {
        const channel = await this.findChannelByName(room);
        const messages = await this.messageRepository.find({
            where: {
                channel: channel,
            }
        });
        return messages.sort((a, b) => a.createdTime.getTime() - b.createdTime.getTime());
    }
    async getChannelMessagesByRoomId(roomId) {
        const channel = await this.findChannelById(roomId);
        const messages = await this.messageRepository.find({
            where: {
                channel: channel,
            }
        });
        return messages.sort((a, b) => a.createdTime.getTime() - b.createdTime.getTime());
    }
    async saveMessage(message, channelId) {
        const currentChannel = await this.findChannelById(channelId);
        console.log('[saveMessage] channel ', channelId, ' : ', currentChannel);
        return await this.messageRepository.save({
            content: message,
            channel: currentChannel,
        });
    }
};
ChannelService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(channel_entity_1.Channel)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ChannelService);
exports.ChannelService = ChannelService;
//# sourceMappingURL=channel.service.js.map