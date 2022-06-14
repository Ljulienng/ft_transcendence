import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Event } from './event';
import { Socket, Server } from 'socket.io';
import { UserService } from 'src/user/service/user.service';
import { Point } from './interfaces/point.interface';
import { PongService } from './pong.service';
import { Player } from './player';
import { GameState } from './game';

// TODO: stop game if both player are disconnected ?
// TODO: save stats in db

@WebSocketGateway({ namespace: 'play', path: '/play', cors: { origin: true, credentials: true } })
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  private server: Server;

  constructor(
    private pongService: PongService,
    private userService: UserService
  ) { }

  afterInit(server: Server) {
    this.server = server;
  }

  async handleConnection(client: Socket) {
    this.pongService.games = this.pongService.games.filter(e => e.state != GameState.OVER);
    const user = await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1]);
    const game = this.pongService.findGame(user.id);
    if (game) {
      game.reconnectPlayer(user.id, client);
      return;
    }

    const event = new Event(this.server);
    const player = new Player(event, client, user);
    this.pongService.matchmake(event, player);
  }

  async handleDisconnect(client: Socket) {
    const user = await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1]);
    const game = this.pongService.findGame(user.id);
    if (game) {
      game.disconnectPlayer(user.id);
    } else {
      this.pongService.waitingPlayers.filter(e => e.user.id != user.id);
    }
  }

  @SubscribeMessage('playerMove')
  async movePaddle(client: Socket, data: Point) {
    const user = await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1]);
    const game = this.pongService.findGame(user.id);
    const player = game.findPlayer(user.id);
    const opponent = game.findOpponent(user.id);
    game.setState(await player.move(opponent, data.x, data.y));
  }

  @SubscribeMessage('playerLeave')
  async disconnect(client: Socket) {
    this.handleDisconnect(client);
  }
}
