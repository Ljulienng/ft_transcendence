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
import { CreateMessageDto } from "src/message/models/createMessage.dto";
import { MessageService } from "src/message/service/message.service";
import { ChildEntity } from "typeorm";

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
        private messageService: MessageService,
    ){}

    afterInit(server: any) {
        console.log('init chat');
    }

    /* https://lucaball.doesweb.dev/socket-io-rooms-and-nestjs-how-to
        we listen to the 'room' event and join the client to the room
    */
    async handleConnection(client: Socket, room: string) {
        console.log('client connected to the chat');
        client.join(room);                          // add this client to the room
        this.server.to(room).emit('client_join');   // send the info to other members of this channel
        const messages = await this.channelService.getChannelMessagesByRoom(room);   // MODIFY dto
        this.server.to(client.id).emit('channelMessages', messages);    // send messages of the channel to the new user
    }

    handleDisconnect(client: any) {
        console.log('client disconnected');
    }

    /* TO REMOVE - ACCESS BY CONTROLLER (endpoint /channel) */
    @SubscribeMessage('addChannel')
    async createChannel(client: Socket, createChannel: CreateChannelDto) {
        const newChannel = await this.channelService.createChannel(createChannel, client.data.user);
        console.log(newChannel);
    }

    /* connect user to a channel */
    @SubscribeMessage('joinChannel')
    async joinChannel(client: Socket, channel: Channel) {
        await this.channelService.addUserToChannel(channel, client.data.user.id);
    }

    @SubscribeMessage('leaveChannel')
    async leaveChannel(client: Socket, channel: Channel) {
        await this.channelService.removeUserToChannel(channel, client.data.user.id);
    }

     /*
     ** add a new message
     */
    @SubscribeMessage('addMessage') 
    async sendMessage(client: Socket, message: CreateMessageDto /*string*/) {
        console.log('Send message');
        this.server.emit('messageSent', message.content);   // send data to all connected clients
        await this.messageService.saveMessage(message); 
    }

}