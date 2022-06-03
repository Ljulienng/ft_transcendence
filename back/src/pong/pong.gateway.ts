import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { SocketUserI } from 'src/chat/chat.gateway';
import { UserService } from 'src/user/service/user.service';
import { Point } from './interfaces/pong.interface';
import { PongService } from './pong.service';

// TODO: create rooms for games

@WebSocketGateway({ namespace: '/play', cors: { origin: true, credentials: true } })
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private pongService: PongService,
    private userService: UserService
  ) { }

  @WebSocketServer() server: Server;
  socketList: SocketUserI[] = []; // Socket connected linked to their users entities list

  afterInit(server: Server) {
    this.pongService.initServer(server);
  }

  async handleConnection(client: Socket) {
    // TODO: check client count to create rooms
    const newSocket: SocketUserI = {
      socketId: client.id,
      user: await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1])
    };

    // TODO: push only if not already in list
    this.socketList.push(newSocket);
    this.pongService.registerPlayer(newSocket);
  }

  handleDisconnect(client: Socket) {
    this.pongService.disconnectPlayer(this.socketList.find(e => e.socketId == client.id));
  }

  @SubscribeMessage('playerMove')
  movePaddle(client: Socket, data: Point) {
    this.pongService.movePlayer(client.id, data.x, data.y);
  }

  @SubscribeMessage('playerReady')
  playerReady(client: Socket) {
    this.pongService.playerReady(client.id);
  }
}
