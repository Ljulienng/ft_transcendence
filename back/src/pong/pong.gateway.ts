import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserService } from 'src/user/service/user.service';
import { Point, SocketPlayer } from './interfaces/pong.interface';
import { PongService } from './pong.service';

@WebSocketGateway({ namespace: '/play', cors: { origin: true, credentials: true } })
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  private server: Server;
  private waitingQueue: SocketPlayer[] = [];

  constructor(private pongService: PongService, private userService: UserService) { }

  afterInit(server: Server) {
    this.pongService.initServer(server);
  }

  async handleConnection(client: Socket) {
    const newSocket: SocketPlayer = {
      socket: client,
      user: await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1])
    };
    if (this.waitingQueue.find(e => e.user.username == newSocket.user.username)) {
      return;
    }
    if (this.pongService.getPlayingList() && this.pongService.getPlayingList().find(e => e.user.username == newSocket.user.username)) {
      this.pongService.playerReady(newSocket);
      return;
    }

    this.waitingQueue.push(newSocket);

    const players: [SocketPlayer, SocketPlayer] = this.pongService.matchmake(this.waitingQueue);
    if (!players[0] || !players[1]) {
      return;
    }
    this.pongService.start(players[0], players[1], 5); // TODO: retrieve winScore instead of fixing it here
    console.log((this.server.adapter as any).rooms);
  }

  async handleDisconnect(client: Socket) {
    const newSocket: SocketPlayer = {
      socket: client,
      user: await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1])
    };
    this.pongService.disconnectPlayer(newSocket);
  }

  @SubscribeMessage('playerMove')
  movePaddle(client: Socket, data: Point) {
    this.pongService.movePlayer(client.id, data.x, data.y);
  }
}
