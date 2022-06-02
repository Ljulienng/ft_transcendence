import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Point } from './interfaces/pong.interface';
import { PongService } from './pong.service';

// TODO: create rooms for games

@WebSocketGateway({ namespace: '/play', cors: { origin: true, credentials: true }})
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private pongService: PongService) {}

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    this.pongService.initServer(server);
  }

  handleConnection(client: Socket) {
    this.pongService.registerPlayer(client.id);
    // TODO: check client count to create rooms
  }

  handleDisconnect(client: Socket) {
    this.pongService.disconnectPlayer(client.id);
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
