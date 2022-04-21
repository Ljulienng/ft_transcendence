import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    handlemessage(client: Socket, payload: string): void;
    afterInit(server: any): void;
    handleConnection(client: any, ...args: any[]): void;
    handleDisconnect(client: any): void;
}
