import { 
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'
import { Channel } from "src/channel/models/channel.entity";
import { CreateChannelDto } from "src/channel/models/createChannel.dto";
import { ChannelService } from "src/channel/service/channel.service";

/*
** OnGatewayInit        : need to implement afterInit()
** OnGatewayConnection  : need to implement handleConnection()
** OnGatewayDisconnect  : need to implement handleDisconnect()
*/

@WebSocketGateway({     // decorator to access to the socket.io functionnality
    namespace: '/chat',
    cors: {
        origin: true,
        credentials: true
    },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;  // instance of socket server

    constructor(
        private channelService: ChannelService,
    ){}

    afterInit(server: any) {
        console.log('init chat');
    }

    handleConnection(client: any, ...args: any[]) {
        console.log('client connected');
    }

    handleDisconnect(client: any) {
        console.log('client disconnected');
    }

    /* TO REMOVE - ACCESS BY CONTROLLER (endpoint /channel) */
    // @SubscribeMessage('addChannel')
    // async createChannel(client: Socket, createChannel: CreateChannelDto) {
    //     const newChannel = await this.channelService.createChannel(createChannel, client.data.user);
    //     console.log(newChannel);
    // }

    /* connect user to a channel */
    @SubscribeMessage('joinChannel')
    async joinChannel(client: Socket, channel: Channel) {
        await this.channelService.addUserToChannel(channel, client.data.user.id);
    }

    @SubscribeMessage('leaveChannel')
    async leaveChannel(client: Socket) {
        // await this.channelService.removeUserToChannel(channel, client.data.user.id);
    }

     /*
     ** listen to 'addMessage' event
     ** add a new message
     */
    @SubscribeMessage('addMessage') 
    /*async*/ sendMessage(client: Socket, message: string): void {
        console.log('Send message');
        this.server.emit('messageSent', message);   // send data to all connected clients
        // await this.channelService.addMessage();
    }


}