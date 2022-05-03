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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const channel_entity_1 = require("../channel/models/channel.entity");
const createChannel_dto_1 = require("../channel/models/createChannel.dto");
const channel_service_1 = require("../channel/service/channel.service");
const createMessage_dto_1 = require("../message/models/createMessage.dto");
const message_service_1 = require("../message/service/message.service");
let ChatGateway = class ChatGateway {
    constructor(channelService, messageService) {
        this.channelService = channelService;
        this.messageService = messageService;
    }
    afterInit(server) {
        console.log('init chat');
    }
    async handleConnection(client, room) {
        console.log('client connected to the chat');
        client.join(room);
        this.server.to(room).emit('client_join');
        const messages = await this.channelService.getChannelMessagesByRoom(room);
        this.server.to(client.id).emit('channelMessages', messages);
    }
    handleDisconnect(client) {
        console.log('client disconnected');
    }
    async createChannel(client, createChannel) {
        console.log('Create chat:', createChannel.name, ' in back by user:', client.id);
        const newChannel = await this.channelService.createChannel(createChannel, client.data.userId);
        console.log(newChannel);
    }
    async joinChannel(client, channel) {
        await this.channelService.addUserToChannel(channel, client.data.user.id);
    }
    async leaveChannel(client, channel) {
        await this.channelService.removeUserToChannel(channel, client.data.user.id);
    }
    async sendMessage(client, message) {
        console.log('Message sent to the back : ', message.content);
        this.server.emit('messageSent', message.content);
        await this.messageService.saveMessage(message);
    }
    testMessage(client, message) {
        console.log('Message sent to the back : ', message);
        client.emit('messageSent', message);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('addChannel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, createChannel_dto_1.CreateChannelDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "createChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinChannel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, channel_entity_1.Channel]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "joinChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveChannel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, channel_entity_1.Channel]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "leaveChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('addMessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, createMessage_dto_1.CreateMessageDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "sendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "testMessage", null);
ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/chat',
        cors: {
            origin: true,
            credentials: true
        },
    }),
    __metadata("design:paramtypes", [channel_service_1.ChannelService,
        message_service_1.MessageService])
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map