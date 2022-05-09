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

}