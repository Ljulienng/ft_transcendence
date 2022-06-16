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
import { CreateMessageDto } from "src/message/models/message.dto";
import { CreateMessageUserDto } from "src/messageUser/models/messageUser.dto";
import { channelInvitationDto, JoinChannelDto, updateMemberDto, changePasswordDto, updateChannelDto } from "src/channel/models/channel.dto";
import { ChannelService } from "src/channel/service/channel.service";
import { SocketGuard } from "src/auth/guards/socket.guard";
import { UseGuards } from "@nestjs/common";
import { CreateChannelDto } from "src/channel/models/channel.dto";
import { User } from "./models/user.entity";
import { UpdateMemberChannelDto } from "src/channelMember/models/channelMember.dto";
import { OnEvent } from '@nestjs/event-emitter'
import { ChannelMember } from "src/channelMember/models/channelMember.entity";
import { UserModule } from "./user.module";

export interface SocketUserI {
    socketId: string;
    socket: Socket;
    user: User;
}

@WebSocketGateway({
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
            socket: client,
            user: null
        }
        // Link client socket to his user entity
        newSocket.socketId = client.id;
        newSocket.user = await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1]);
        if (newSocket.user)
            console.log('client connected to the Server, user = ', newSocket.user.username);
        else
            return ;
		this.socketList.push(newSocket);

	}

	async handleDisconnect(client: Socket) {
        const index = this.socketList.indexOf(this.socketList.find(socket => socket.socketId === client.id))
        const user = this.socketList.find((socket) => socket.socketId === client.id).user
        // console.log(this.socketList[index].user.username ,'has disconnected from the server');

        if (index > -1)
            this.socketList.splice(index, 1);
        // this.docketListthis.socketList.find(socket => socket.socketId === client.id)
    }

	@SubscribeMessage('connectUser')
	async connectUser(client: Socket, username: string) {
		const user = await this.userService.findByUsername(username);

		console.log('user:', user.username, 'is connected');
		this.userService.setStatus(user, 'Online');
        this.server.to(client.id).emit("Connected");
        this.socketList.forEach(async (socket) => {
            if(await this.userService.checkIfFriend(user.id, socket.user.id))                
                this.server.to(socket.socketId).emit("friendConnected");
        })
	}

	@SubscribeMessage('disconnectUser')
	async disconnectUser(client: Socket, username: string) {
		const user = await this.userService.findByUsername(username);

        if (!user)
            return ;
		console.log('user:', user.username, 'is disconnected');
		this.userService.setStatus(user, "Offline");
        this.socketList.forEach(async (socket) => {
        if(await this.userService.checkIfFriend(user.id, socket.user.id))                
                this.server.to(socket.socketId).emit("friendDisconnected");
        })
	}



	/* ============= CHANNEL CHAT PART ============*/

	@UseGuards(SocketGuard)
    @SubscribeMessage('getChannelMsg')
    async getChannelMsg(client: Socket, channelId: number) {
        const user = this.socketList.find(socket => socket.socketId === client.id).user
        const channel = await this.channelService.findChannelById(channelId);
        const messages = await this.channelService.findChannelMessagesByChannelName(user, channel.name)
        const index = this.socketList.indexOf(this.socketList.find(socket => socket.socketId === client.id))
        // console.log(this.socketList[index].user.username ,'wants the msgs');

        this.server.emit('getChannelMessages' + this.socketList[index].user.id, messages)
    }

	@UseGuards(SocketGuard)
    @SubscribeMessage('createChannel')
    async createChannel(client: Socket, createChannel: CreateChannelDto) {
        const user = this.socketList.find(socket => socket.socketId === client.id).user
        const channelId = await this.channelService.createChannel(createChannel, user.id)
            .then(async () => { 
                this.server.emit("updateChannel", await this.channelService.findAll());
                this.server.to(client.id).emit("updateJoinedChannel", await this.userService.joinedChannel(user))
            })
            .catch(error => {
                this.server.to(client.id).emit("/createChannelError/", error.response)
            })
            client.join(String(channelId));
    }

	@UseGuards(SocketGuard)
    @SubscribeMessage('deleteChannel')
    async deleteChannel(client: Socket, channelId: number) {
        const user = this.socketList.find(socket => socket.socketId === client.id).user

        await this.channelService.deleteChannel(user.id, channelId);
        this.server.emit("updateChannel", await this.channelService.findAll());
        this.server.to(String(channelId)).emit("updateMembersJoinedChannels");
        this.server.emit("/userLeft/channel/" + channelId);
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('updateJoinedChannels')
    async updateJoinedChannels(client: Socket) {
        const user = this.socketList.find(socket => socket.socketId === client.id).user
        // this.server.emit("updateChannel", await this.channelService.findAll());
        this.server.to(client.id).emit("updateJoinedChannel", await this.userService.joinedChannel(user));
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('joinChannel')
    async joinChannel(client: Socket, joinChannel: JoinChannelDto) {
        const user = this.socketList.find(socket => socket.socketId === client.id).user
        
        await this.channelService.addUserToChannel(joinChannel, user.id);
        client.join(String(joinChannel.id));
        this.server.emit("updateChannel", await this.channelService.findAll());
        this.server.to(client.id).emit("updateJoinedChannel", await this.userService.joinedChannel(user));
        this.server.emit("/userJoined/channel/" + joinChannel.id);
        this.server.emit("/userJoined/" + user.username, (await this.channelService.findChannelById(joinChannel.id)).name);
    }

    // @UseGuards(JwtAuthGuard, TwoFAAuth)
    @UseGuards(SocketGuard)
    @SubscribeMessage('leaveChannel') 
    async leaveChannel(client: Socket, channelId: number) {
        const user = this.socketList.find(socket => socket.socketId === client.id).user

        this.server.emit("/userLeft/" + user.username, (await this.channelService.findChannelById(channelId)).name);
        await this.channelService.deleteChannelMember(channelId, user.id);
        this.server.emit("updateChannel", await this.channelService.findAll());
        this.server.to(String(channelId)).emit("updateMembersJoinedChannels");
        client.leave(String(channelId));
        this.server.emit("/userLeft/channel/" + channelId);
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('inviteInPrivateChannel')
    async inviteUserInChannel(client: Socket, invitation: channelInvitationDto) {
        const user = this.socketList.find(socket => socket.socketId === client.id).user
        const guest = await this.channelService.inviteUserInChannel(user, invitation);
        
        const guestSocket = (this.socketList.find(s => s.user.id === guest.id )).socket;
        guestSocket.join(String(invitation.channelId));
        // this.server.emit("updateChannel", await this.channelService.findAll());
        this.server.to(guestSocket.id).emit("updateJoinedChannel", await this.userService.joinedChannel(guest));
        this.server.emit("/invitationChannel/" + guest.username, (await this.channelService.findChannelById(invitation.channelId)).name);
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('upgradeMember')
    async setChannelMemberAsAdmin(client: Socket, upgradeMember: updateMemberDto) {
        const owner = this.socketList.find(socket => socket.socketId === client.id).user
        await this.channelService.setMemberAsAdmin(owner, upgradeMember);
        this.server.emit("/adminPromoted/" + upgradeMember.channelId)
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('downgradeMember')
    async unsetChannelMemberAsAdmin(client: Socket, downgradeMember: updateMemberDto) {
        const owner = this.socketList.find(socket => socket.socketId === client.id).user
        await this.channelService.unsetMemberAsAdmin(owner, downgradeMember);
        this.server.emit("/adminUnpromoted/" + downgradeMember.channelId)
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('kickMember') 
    async kickMember(client: Socket, member: updateMemberDto) {
        const user = this.socketList.find(socket => socket.socketId === client.id).user
        const userToKick = await this.userService.findByUsername(member.username)

        await this.channelService.deleteChannelMember(member.channelId, userToKick.id);
        this.server.emit("/memberKicked/channel/" + member.channelId);
        this.server.emit("/userKicked/" + member.username, (await this.channelService.findChannelById(member.channelId)).name);
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('muteban')
    async muteOrBan(client: Socket, update: UpdateMemberChannelDto) {
        const user = this.socketList.find(socket => socket.socketId === client.id).user
        await this.channelService.updateMember(user, update);
        const userToUpdate = await this.userService.findByUsername(update.username);
        const userToUpdateSocket = (this.socketList.find(s => s.user.id === userToUpdate.id )).socket;
        const channel = await this.channelService.findChannelById(update.channelId);
        this.server.to(userToUpdateSocket.id).emit("channelMemberInfo", await this.channelService.findMember(userToUpdate, channel));
        this.server.emit('messageUpdate/' + channel.id);
        this.server.emit("/userUpdated/channel/" + channel.id);
        this.server.emit("/muteorban/" + userToUpdate.username, (await this.channelService.findChannelById(channel.id)).name);
    }
    
    @OnEvent('unmutedOrUnbannedMember')
    sendDataToFront() {
        // console.log("On event unmutedOrUnbannedMember");
        this.server.emit("channelMembersInfo");
        this.server.emit("/userUpdated/channel/");
        

    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('getChannelMemberInfo') 
    async getChannelMemberInfo(client: Socket, channelId: number) {
        const user = this.socketList.find(socket => socket.socketId === client.id).user
        const members = await this.channelService.findMembers(channelId);
        const member = members.find(u => u.user.id === user.id);
        this.server.to(client.id).emit("channelMemberInfo", member);
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('changePassword') 
    async changePassword(client: Socket, passwordI: changePasswordDto) {
        const user = this.socketList.find(socket => socket.socketId === client.id).user
        await this.channelService.changePassword(user.id, passwordI)
            .then(() => {
                this.server.to(client.id).emit("/passwordChanged/", "password is changed")
            })
            .catch(error => {
                this.server.to(client.id).emit("/passwordError/", error.response)
            })
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('addPasswordToPublicChannel')
    async addPasswordToPublicChannel(client: Socket, passwordI: changePasswordDto) {
        const user = this.socketList.find(socket => socket.socketId === client.id).user
        await this.channelService.addPasswordToPublicChannel(user, passwordI)
            .then(async () => {
                this.server.emit("updateChannel", await this.channelService.findAll());
                // this.server.to(String(passwordI.channelId)).emit("updateMembersJoinedChannels");
                // this.server.to(client.id).emit("/passwordAdded/", "password is added, channel is now protected")
            })
            .catch(error => {
                this.server.to(client.id).emit("/passwordAddedError/", error.response)
            })
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('removePasswordToProtectedChannel')
    async removePasswordToProtectedChannel(client: Socket, channelId: number) {
        const user = this.socketList.find(socket => socket.socketId === client.id).user
        await this.channelService.removePasswordToProtectedChannel(user, channelId)
            .then(async () => {
                this.server.emit("updateChannel", await this.channelService.findAll());
                // this.server.to(String(channelId)).emit("updateMembersJoinedChannels");
                // this.server.to(client.id).emit("/passwordRemoved/", "password is removed, channel is now public")
            })
            .catch(error => {
                this.server.to(client.id).emit("/passwordRemovedError/", error.response)
            })
            
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('changeChannelName')
    async changeChannelName(client: Socket, updates: updateChannelDto) {
        const owner = this.socketList.find(socket => socket.socketId === client.id).user
        await this.channelService.changeChannelName(owner, updates);
        
        this.server.emit("updateChannel", await this.channelService.findAll());
        this.server.to(String(updates.channelId)).emit("updateMembersJoinedChannels");
    }


    @UseGuards(SocketGuard)
    @SubscribeMessage('sendMessageToServer') 
    async sendMessage(client: Socket, createMessageDto: CreateMessageDto /*message: string, channelId: number*/) {
        // console.log('Message sent to the back in channel ', createMessageDto);
        // client.emit('messageUpdate', message, channelId);
        // this.server.emit('sendMessageToClient', createMessageDto.content);
        await this.channelService.saveMessage(createMessageDto.userId, createMessageDto);
        this.server.emit('messageUpdate/' + createMessageDto.channelId);
    }

    /* ============= USER CHAT PART ============*/

	@UseGuards(SocketGuard)
    @SubscribeMessage('getUserMsg')
    async getUserMsg(client: Socket, userId: number) {
        const sender :User = this.socketList?.find(socket => socket.socketId === client.id).user
        const receiver :User = await this.userService.findOne({id: userId});
        const messages = await this.userService.getMessage(sender.id, receiver.id)

        this.server.emit('getUserMessages' + receiver.id, messages)
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('sendMessageToUser') 
    async sendMessageUser(client: Socket, createMessageUserDto: CreateMessageUserDto) {
        console.log('Message sent to the back in User ', createMessageUserDto);
        const senderSocket = this.socketList.find(socket => socket.user.id === createMessageUserDto.senderId)
        // VERIFY IF THE USER IS BLOCKED 
        if (await this.userService.checkIfBlocked(senderSocket.user, createMessageUserDto.receiverId)) {
            this.server.to(client.id).emit('chatBlocked', createMessageUserDto.content);
            return ;
        }
        await this.userService.saveMessage(createMessageUserDto.senderId, createMessageUserDto);
        // this.server.emit('messageSentFromUser' + createMessageUserDto.senderId, createMessageUserDto.content);
        this.server.to(client.id).emit('messageSent');
        this.server.emit('messageSentFromUser' + createMessageUserDto.senderId, createMessageUserDto.content);
    }

    /* ============= BLOCK USER ============*/

    @UseGuards(SocketGuard)
    @SubscribeMessage('blockUser') 
    async blockUser(client: Socket, userId: number) {
        const user :User = this.socketList.find(socket => socket.socketId === client.id).user;
        
        await this.userService.blockUser(user, userId);
        this.server.emit('updateBlocked/' + user.id);
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('unblockUser') 
    async unblockUser(client: Socket, userId: number) {
        const user :User = this.socketList.find(socket => socket.socketId === client.id).user;
        
        await this.userService.unblockUser(user, userId);
        this.server.emit('updateBlocked/' + user.id);
    }
    // @UseGuards(SocketGuard)
    // @SubscribeMessage('blockUser') 
    // async blockUser(client: Socket, userId: number) {
    //     const user :User = await this.socketList.find(socket => socket.socketId === client.id).user;
        
    //     await this.userService.blockUser(user, userId);
    // }

    /* ============= FRIEND USER ============*/
    @UseGuards(SocketGuard)
    @SubscribeMessage('addFriend') 
    async addFriend(client: Socket, userId: any) {
        const user :User = this.socketList.find(socket => socket.socketId === client.id).user;
        
        await this.userService.addFriend(user, userId);
        this.server.to(client.id).emit('friendAdded');
        this.server.emit('/friendAdded/' + userId.friendUsername, user.username)
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('deleteFriend') 
    async deleteFriend(client: Socket, userToDelete: string) {
        const user :User = this.socketList.find(socket => socket.socketId === client.id).user;
        
        await this.userService.deleteFriend(user, userToDelete);
        this.server.to(client.id).emit('friendDeleted');
        this.server.emit('/friendDeleted/' + userToDelete, user.username)
    }

    /* ============= GAME USER ============*/

    @UseGuards(SocketGuard)
    @SubscribeMessage('matchInvitation')
    async matchInvitation(client: Socket, userToInvite: number) {
        const user :User = this.socketList.find(socket => socket.socketId === client.id).user;

        this.server.to(client.id).emit("moveToMatch");
        this.server.emit('matchInvitation/' + userToInvite, {id: user.id, username: user.username} as unknown);
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('matchAccepted')
    acceptMatch(client: Socket, otherUser: number) {
        this.server.to(client.id).emit("moveToMatch");
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('matchRefused')
    refuseMatch(client: Socket, otherUser: number) {
        this.server.emit("matchRefused/" + otherUser);
    }
}
