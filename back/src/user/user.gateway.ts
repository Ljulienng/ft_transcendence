import { Socket, Server } from "socket.io";
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect} from "@nestjs/websockets"
import { UserService } from "./service/user.service";

@WebSocketGateway({
	namespace: '/user',
	cors: {
		origin: true,
		credentials: true
	}
})

export class UserGateway {
	@WebSocketServer() server: Server;

	constructor(private userService: UserService) {}

	async handleConnection(client: Socket) {
		console.log('Client connected to the server');
	}

	@SubscribeMessage('connectUser')
	async connectUser(client: Socket, username: string) {
		const user = await this.userService.findByUsername(username);

		console.log('user:', user, 'is connected');
		this.userService.setStatus(user, 'Online');
	}

	@SubscribeMessage('disconnectUser')
	async disconnectUser(client: Socket, username: string) {
		const user = await this.userService.findByUsername(username);

		console.log('user:', user.username, 'is disconnected');
		this.userService.setStatus(user, "Offline");
	}
}