import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { Channel } from "src/channel/models/channel.entity";
import { ChannelService } from "src/channel/service/channel.service";
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private channelService;
    server: Server;
    constructor(channelService: ChannelService);
    afterInit(server: any): void;
    handleConnection(client: any, ...args: any[]): void;
    handleDisconnect(client: any): void;
    joinChannel(client: Socket, channel: Channel): Promise<void>;
    leaveChannel(client: Socket): Promise<void>;
    sendMessage(client: Socket, message: string): void;
}
