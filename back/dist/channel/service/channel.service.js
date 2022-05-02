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
        return await this.channelRepository.findOneOrFail({
            where: { id: channelId }
        });
    }
    async findChannelByName(channelName) {
        return await this.channelRepository.findOneOrFail({
            where: { name: channelName }
        });
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
        });
        if (newChannel.type === channel_entity_1.ChannelType.protected || newChannel.type === channel_entity_1.ChannelType.private) {
            if (!newChannel.password) {
                throw new common_1.BadRequestException('need a password for private or protected channel');
            }
            else {
                const saltOrRounds = await bcrypt.genSalt();
                newChannel.password = await bcrypt.hash(newChannel.password, saltOrRounds);
            }
        }
        return await this.channelRepository.save(newChannel);
    }
    async checkPasswordMatch(sentPassword, expectedPassword) {
        return await bcrypt.compare(sentPassword, expectedPassword);
    }
    async addUserToChannel(channel, userId) {
        const user = await this.userRepository.findOne({ id: userId });
        const welcomingChannel = await this.findChannelById(channel.id);
        if (welcomingChannel.type !== channel_entity_1.ChannelType.public) {
            if (welcomingChannel.password) {
                const match = this.checkPasswordMatch(welcomingChannel.password, channel.password);
                if (!match) {
                    throw new common_1.UnauthorizedException('incorrect password');
                }
            }
        }
        if (welcomingChannel.users.find((u) => u.id === user.id)) {
            throw new common_1.UnauthorizedException('user already in this channel');
        }
    }
    async deleteChannel(channelId) {
        const channel = await this.findChannelById(channelId);
        if (!channel) {
            throw new common_1.NotFoundException();
        }
        return this.channelRepository.remove(channel);
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