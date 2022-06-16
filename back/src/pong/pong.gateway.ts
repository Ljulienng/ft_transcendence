import {
  OnGatewayInit,
  OnGatewayDisconnect,
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
import { Spectator } from './interfaces/spectator.interface';
import { Options } from './interfaces/options.interface';
import { UserGateway } from 'src/user/user.gateway';
import { ChannelService } from 'src/channel/service/channel.service';

// TODO: stop game if both player are disconnected ? => YES and remove it / set status in DB
// TODO: test spectator mode
// TODO: test duels
// TODO: test only one socket
// TODO: link home page with game
// TODO: custom color mode - points - difficulty
// TODO: print player name / picture in front
// TODO: 30 fps
// TODO: timeout before ball starts moving

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class PongGateway extends UserGateway implements OnGatewayDisconnect {

  constructor(
    channelService: ChannelService,
    userService: UserService,
    private pongService: PongService
  ) { super(channelService, userService); }

  @SubscribeMessage('playerJoin') // TODO: test
  async playerJoin(client: Socket) {
    this.pongService.games = this.pongService.games.filter(e => e.state != GameState.OVER);
    const user = await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1]);
    const game = this.pongService.findGame(user.id);
    if (game) {
      game.reconnectPlayer(user.id, client);
      return;
    }
    const event = new Event(this.server);
    const player = new Player(event, client, user);
    const options: Options = {
      bgColor: '#1c1d21',
      fgColor: 'lightgrey',
      winScore: 5
    };
    this.pongService.matchmake(event, player, options);
  }

  @SubscribeMessage('duel') // TODO: test
  async duel(client: Socket, userRightId: number) {
    this.pongService.games = this.pongService.games.filter(e => e.state != GameState.OVER);
    const event = new Event(this.server);
    const userLeft = await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1]);
    const playerLeft = new Player(event, client, userLeft);
    const userRight = await this.userService.findOne({ id: userRightId });
    const playerRight = new Player(event, null, userRight);
    this.pongService.duel(event, playerLeft, playerRight);
  }

  async handleDisconnect(client: Socket) {
    this.playerLeave(client);
  }

  @SubscribeMessage('playerLeave')
  async playerLeave(client: Socket) {
    console.log('PONG: playerleaved event');
    const user = await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1]);
    const game = this.pongService.findGame(user.id);
    if (game) {
      const spectator = game.spectators.find(e => e.user.id == user.id);
      if (spectator) {
        spectator.socket.leave(game.spectatorRoom);
        game.spectators.filter(e => e.user.id != user.id);
      } else {
        game.disconnectPlayer(user.id);
      }
    } else {
      this.pongService.waitingPlayers.filter(e => e.user.id != user.id);
    }
  }

  @SubscribeMessage('playerMove')
  async playerMove(client: Socket, data: Point) {
    const user = await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1]);
    const game = this.pongService.findGame(user.id);
    const player = game.findPlayer(user.id);
    const opponent = game.findOpponent(user.id);
    game.setState(await player.move(opponent, data.x, data.y));
  }

  @SubscribeMessage('spectate') // TODO: test
  async spectate(client: Socket, userId: number) {
    this.pongService.games = this.pongService.games.filter(e => e.state != GameState.OVER);
    const user = await this.userService.findByCookie(client.handshake.headers.cookie.split('=')[1]);
    const game = this.pongService.findGame(userId);
    if (game == null) {
      // TODO: this player is not in a game
      console.error('Cannot spectate because this player is not in a game.')
      return;
    }
    const spectator: Spectator = {
      socket: client,
      user: user
    };
    game.connectSpectator(spectator);
  }
}
