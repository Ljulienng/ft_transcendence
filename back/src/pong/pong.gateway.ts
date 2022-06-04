import { IoAdapter } from '@nestjs/platform-socket.io';
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

// TODO: create rooms for games

@WebSocketGateway({ namespace: '/play', cors: { origin: true, credentials: true } })
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private pongService: PongService,
    private userService: UserService
  ) { }

  @WebSocketServer() server: Server;
  waitingList: SocketPlayer[] = [];

  afterInit(server: Server) {
    this.pongService.initServer(server);
  }

  async handleConnection(client: Socket) {
    //if (this.waitingList.find(e => e.socket.id == client.id)) {
    //  return;
    //}
    //const newSocket: SocketPlayer = {
    //  socket: client,
    //  user: await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1])
    //};
    //this.waitingList.push(newSocket);

    //const players: [SocketPlayer, SocketPlayer] = this.pongService.matchmake(this.waitingList);
    //if (!players[0] || !players[1]) {
    //  return;
    //}

    //this.pongService.start(players[0], players[1], 5); // TODO: retrieve winScore instead of fixing it here
    console.log((this.server.adapter as any).rooms);
    //this.pongService.registerPlayer(newSocket);
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

  @SubscribeMessage('playerReady')
  async playerReady(client: Socket) {
    //const newSocket: SocketPlayer = {
    //  socket: client,
    //  user: await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1])
    //};
   //this.pongService.playerReady(newSocket);

    const newSocket: SocketPlayer = {
      socket: client,
      user: await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1])
    };
    if (this.waitingList.find(e => e.user.username == newSocket.user.username)) {
      return;
    }
    if (this.pongService.getPlayingList() && this.pongService.getPlayingList().find(e => e.user.username == newSocket.user.username)) {
      this.pongService.playerReady(newSocket);
      return ;
    }

    this.waitingList.push(newSocket);

    const players: [SocketPlayer, SocketPlayer] = this.pongService.matchmake(this.waitingList);
    if (!players[0] || !players[1]) {
      return;
    }
    this.pongService.start(players[0], players[1], 5); // TODO: retrieve winScore instead of fixing it here
    console.log((this.server.adapter as any).rooms);
  }
}
