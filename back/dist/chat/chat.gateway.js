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
const createChannel_dto_1 = require("../channel/models/createChannel.dto");
const channel_service_1 = require("../channel/service/channel.service");
let ChatGateway = class ChatGateway {
    constructor(channelService) {
        this.channelService = channelService;
    }
    afterInit(server) {
        console.log('init chat');
    }
    handleConnection(client, ...args) {
        console.log('client connected');
    }
    handleDisconnect(client) {
        console.log('client disconnected');
    }
    async createChannel(socket, createChannel) {
        const newChannel = await this.channelService.createChannel(createChannel);
        console.log(newChannel);
    }
    handlemessage(client, message) {
        console.log('Send message');
        this.server.emit('messageSent', message);
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
    (0, websockets_1.SubscribeMessage)('addMessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handlemessage", null);
ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/chat',
        cors: { origin: true, credentials: true }
    }),
    __metadata("design:paramtypes", [channel_service_1.ChannelService])
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map