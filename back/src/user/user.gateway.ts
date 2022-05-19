import { Socket, Server } from "socket.io";
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect} from "@nestjs/websockets"
import { UserService } from "./service/user.service";
import { Req } from "@nestjs/common";

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

export class UserGateway {
	@WebSocketServer() server: Server;

	constructor(
		private userService: UserService
	) {}
	// connectedUser: []

	async handleConnection(client: Socket) {
		// console.log(req)

		console.log('Client connected to the server');
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
}