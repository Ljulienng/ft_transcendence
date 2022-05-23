import { Socket, Server } from "socket.io";
import { 
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import { UserService } from "./service/user.service";
import { Channel } from "src/channel/models/channel.entity"
import { CreateMessageDto } from "src/message/models/message.dto";

import { JoinChannelDto } from "src/channel/models/channel.dto";
import { SocketUserI } from "src/chat/chat.gateway";
import { ChannelService } from "src/channel/service/channel.service";
import { SocketGuard } from "src/auth/guards/socket.guard";
import { UseGuards } from "@nestjs/common";



// export type UserSocket = {
// 	socketId: string,
// 	userId: number,
// }

@WebSocketGateway({
	namespace: '/user',
	cors: {
		origin: true,
		credentials: true
	}
})

export class UserGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
	@WebSocketServer() server: Server;
	socketList: SocketUserI[] = []; // Socket connected linked to their users entities list


	constructor(
		private channelService: ChannelService,
		private userService: UserService
	) {}
	// connectedUser: []

    afterInit(server: any) {
        console.log('init userGateWay');
    }

	async handleConnection(client: Socket) {
        let newSocket: SocketUserI = {
            socketId: '',
            user: null
        }
        // Link client socket to his user entity
        newSocket.socketId = client.id;
        newSocket.user = await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1]);
        if (newSocket.user)
            console.log('client connected to the Server, user = ', newSocket.user.username);
		this.socketList.push(newSocket);

	}

	async handleDisconnect(client: Socket) {
        const index = await this.socketList.indexOf(this.socketList.find(socket => socket.socketId === client.id))
        console.log(this.socketList[index].user.username ,'has disconnected from the server');
        if (index > -1)
            this.socketList.splice(index, 1);
        // this.docketListthis.socketList.find(socket => socket.socketId === client.id)
    }

	@SubscribeMessage('connectUser')
	async connectUser(client: Socket, username: string) {
		const user = await this.userService.findByUsername(username);

		console.log('user:', user.username, 'is connected');
		this.userService.setStatus(user, 'Online');
	}

	@SubscribeMessage('disconnectUser')
	async disconnectUser(client: Socket, username: string) {
		const user = await this.userService.findByUsername(username);

		console.log('user:', user.username, 'is disconnected');
		this.userService.setStatus(user, "Offline");
	}



	/* ============= CHAT PART ============*/

	@UseGuards(SocketGuard)
    @SubscribeMessage('getChannelMsg')
    async getChannelMsg(client: Socket, channelId: number) {
        const channel = await this.channelService.findChannelById(channelId);
        const messages = await this.channelService.getChannelMessagesByChannelName(channel.name)

        const index = await this.socketList.indexOf(this.socketList.find(socket => socket.socketId === client.id))
        console.log(this.socketList[index].user.username ,'wants the msgs');

        this.server.emit('getChannelMessages' + this.socketList[index].user.id, messages)
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
        await this.channelService.saveMessage(/*client.id*/createMessageDto.userId, createMessageDto/*.content, createMessageDto.channelId*/);
        this.server.emit('messageSent', createMessageDto.content);
    }


}