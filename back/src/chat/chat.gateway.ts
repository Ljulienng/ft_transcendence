import { 
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import { Logger } from '@nestjs/common'
import { Server, Socket } from 'socket.io'

/*
** OnGatewayInit        : need to implement afterInit()
** OnGatewayConnection  : need to implement handleConnection()
** OnGatewayDisconnect  : need to implement handleDisconnect()
*/

@WebSocketGateway({     // decorator to access to the socket.io functionnality
    namespace: '/chat',
    cors: { origin: true, credentials: true }
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;  // instance of socket server
    private logger: Logger = new Logger('ChatGateway');

    @SubscribeMessage('msgToServer')    // listen to the 'msgToServer' event
    handlemessage(client: Socket, message: string): void {
        this.server.emit('msgToClient', message);   // send data to all connected clients
    }

    afterInit(server: any) {
        this.logger.log('Init');
    }

    handleConnection(client: any, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: any) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

}