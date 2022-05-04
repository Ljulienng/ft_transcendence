import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { Channel } from "src/channel/models/channel.entity";
import { ChannelService } from "src/channel/service/channel.service";
import { CreateMessageDto } from "src/message/models/createMessage.dto";
import { MessageService } from "src/message/service/message.service";
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private channelService;
    private messageService;
    server: Server;
    constructor(channelService: ChannelService, messageService: MessageService);
    afterInit(server: any): void;
    handleConnection(client: Socket, room: string): Promise<void>;
    handleDisconnect(client: Socket): void;
    joinChannel(client: Socket, channel: Channel): Promise<void>;
    leaveChannel(client: Socket, channel: Channel): Promise<void>;
    sendMessage(client: Socket, createMessageDto: CreateMessageDto): Promise<void>;
}
