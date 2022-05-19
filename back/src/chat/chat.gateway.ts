import { 
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'
import { Channel } from "src/channel/models/channel.entity";
import { CreateChannelDto } from "src/channel/models/channel.dto";
import { JoinChannelDto } from "src/channel/models/channel.dto";
import { ChannelService } from "src/channel/service/channel.service";
import { CreateMessageDto } from "src/message/models/message.dto";
import { MessageService } from "src/message/service/message.service";
import { UserService } from "src/user/service/user.service";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { TwoFAAuth } from "src/auth/guards/twoFA.guard";
import { SocketGuard } from "src/auth/guards/socket.guard";
import { User } from "src/user/models/user.entity";
import { channel } from "diagnostics_channel";
import { receiveMessageOnPort } from "worker_threads";
/*
** OnGatewayInit        : need to implement afterInit()
** OnGatewayConnection  : need to implement handleConnection()
** OnGatewayDisconnect  : need to implement handleDisconnect()
*/

export interface SocketUserI {
    socketId: string;
    user: User;
}

@WebSocketGateway({     // decorator to access to the socket.io functionnality
    namespace: '/chat',
    cors: {
        origin: true,
        credentials: true
    },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;  // instance of socket server
    socketList: SocketUserI[] = []; // Socket connected linked to their users entities list
    
    constructor(
        private channelService: ChannelService,
        // private messageService: MessageService,
        private userService: UserService,
        ){}

    afterInit(server: any) {
        console.log('init chat');
    }

    /* https://lucaball.doesweb.dev/socket-io-rooms-and-nestjs-how-to
        we listen to the 'room' event and join the client to the room
    */ 
    // @UseGuards(SocketGuard)
    async handleConnection(client: Socket, room: string) {
        let newSocket: SocketUserI = {
            socketId: '',
            user: null
        }
        // Link client socket to his user entity
        newSocket.socketId = client.id;
        newSocket.user = await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1]);
        if (newSocket.user)
            console.log('client connected to the chat, user = ', newSocket.user.username);
        this.socketList.push(newSocket);
        // console.log("from socket list = ", this.socketList.find(socket => socket.socketId === client.id)))
        // client.on('room', function(room) {
        //     console.log('room joined = ', room)
        // });
        // client.join(room);                   // add this client to the room
        // this.server.to(room).emit('channelJoined');   // send the info to other members of this channel
        // const messages = await this.channelService.getChannelMessagesByChannelName(room);   // MODIFY dto
        // this.server.to(client.id).emit('channelMessages', messages);    // send messages of the channel to the new user
    }

    async handleDisconnect(client: Socket) {
        const index = await this.socketList.indexOf(this.socketList.find(socket => socket.socketId === client.id))
        console.log(this.socketList[index].user.username ,'has disconnected from chat');
        if (index > -1)
            this.socketList.splice(index, 1);
        // this.docketListthis.socketList.find(socket => socket.socketId === client.id)
    }

    /* connect user to a channel */
    @UseGuards(SocketGuard)
    @SubscribeMessage('getChannelMsg')
    async getChannelMsg(client: Socket, channelId: number) {
        const channel = await this.channelService.findChannelById(channelId);
        const messages = await this.channelService.getChannelMessagesByChannelName(channel.name)

        // console.log('MESSAGE = ', messages)

        this.server.to(client.id).emit('getChannelMessages', messages)
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('joinChannel')
    async joinChannel(client: Socket, joinChannel: JoinChannelDto) {
        const userId = await this.socketList.find(socket => socket.socketId === client.id).user.id
        await this.channelService.addUserToChannel(joinChannel, userId);
        
        const room = await this.channelService.findChannelById(joinChannel.id);
        client.join(room.name);
        this.server.to(room.name).emit('channelJoined', "Hello you join the channe");
        const messages = await this.channelService.getChannelMessagesByChannelName(room.name);
        this.server.to(client.id).emit('channelMessages', messages); 
    } 

    // @UseGuards(JwtAuthGuard, TwoFAAuth)
    @UseGuards(SocketGuard)
    @SubscribeMessage('leaveChannel') 
    async leaveChannel(client: Socket, channel: Channel) {
        await this.channelService.removeUserToChannel(channel, client.data.user.id);

        // this.server.to
    }

     /*
     ** add a new message
     */
    @UseGuards(SocketGuard)
    @SubscribeMessage('sendMessageToServer') 
    async sendMessage(client: Socket, createMessageDto: CreateMessageDto /*message: string, channelId: number*/) {
        console.log('Message sent to the back in channel ', createMessageDto);
        // client.emit('messageSent', message, channelId);
        this.server.emit('sendMessageToClient', createMessageDto.content);
        this.server.emit('messageSent', createMessageDto.content);
        await this.channelService.saveMessage(/*client.id*/createMessageDto.userId, createMessageDto/*.content, createMessageDto.channelId*/);
    }


}