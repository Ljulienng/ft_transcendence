import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { CreateChannelDto } from "src/channel/models/createChannel.dto";
import { ChannelService } from "src/channel/service/channel.service";
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private channelService;
    server: Server;
    constructor(channelService: ChannelService);
    afterInit(server: any): void;
    handleConnection(client: any, ...args: any[]): void;
    handleDisconnect(client: any): void;
    createChannel(socket: Socket, createChannel: CreateChannelDto): Promise<void>;
    sendMessage(client: Socket, message: string): void;
}
