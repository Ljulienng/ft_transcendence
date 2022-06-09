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
import { Player, PlayerState } from './player';
import { Game } from './game';

// TODO: timeout after a player disconnect
// TODO: stop game if both player are disconnected

@WebSocketGateway({ namespace: '/play', cors: { origin: true, credentials: true } })
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
    const user = await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1]);
    // TODO: check if client is already playing/waiting
    const game = this.pongService.findGame(user.username);
    if (game) console.log('co found game ' + game.name);
    else console.log('co found game ' + game);
    if (game) {
      game.connectPlayer(user.username, client);
      return;
    }

    const event = new Event(this.server);
    const player = new Player(event, client, user);
    this.pongService.matchmake(event, player);
  }

  async handleDisconnect(client: Socket) {
    // TODO: if game == null remove player from waiting list
    const user = await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1]);
    const game = this.pongService.findGame(user.username);
    if (game) console.log('disco found game ' + game.name);
    else console.log('disco found game ' + game);
    if (game) {
      game.disconnectPlayer(user.username);
    } else {
      this.pongService.waitingPlayers.filter(e => e.user.username != user.username);
    }
  }

  @SubscribeMessage('playerMove')
  async movePaddle(client: Socket, data: Point) {
    const user = await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1]);
    const game = this.pongService.findGame(user.username);
    // if (game) console.log('mov found game ' + game.name);
    // else console.log('mov found game ' + game);
    const player = game.findPlayer(user.username);
    const opponent = game.findOpponent(user.username);
    game.state = await player.move(opponent, data.x, data.y);
  }
}
