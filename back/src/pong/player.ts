import { Injectable } from '@nestjs/common';
import { User } from 'src/user/models/user.entity';
import { Game, HEIGHT, WIDTH } from './game';
import { Point } from './interfaces/point.interface';
import { Socket } from 'socket.io'
import { Event } from './event';
import { Options } from './interfaces/options.interface';

export enum PlayerState {
  DISCONNECTED,
  CONNECTED
}

@Injectable()
export class Player {

  public static size: Point;
  public y: number;
  public score: number;
  public state: PlayerState;
  public disconnectedAt: Date;

  constructor(
    private event: Event,
    public socket: Socket,
    public user: User,
    public options: Options) {
    Player.size = { x: WIDTH / 100, y: HEIGHT / 6.6 };
    this.y = HEIGHT / 2 - Player.size.y / 2;
    this.score = 0;
    this.state = PlayerState.CONNECTED;
    this.disconnectedAt = null;
  }

  async move(opponent: Player, y: number, canvasHeight: number, spectatorRoom: string, isLeftSide: boolean) {
    y = y / canvasHeight * HEIGHT;
    this.y = y;
    this.event.emitOpponentMove(opponent.socket.id, y);
    this.event.emitPlayerMove(spectatorRoom, isLeftSide, y);
  }

  goal(game: Game) {
    this.score += 1;
    game.sendScore();
    if (this.score >= this.options.winScore) {
      game.gameOver(this);
    }
  }

  reconnect(user: User, socket: Socket) {
    this.user = user;
    this.socket = socket;
    this.state = PlayerState.CONNECTED;
    this.disconnectedAt = null;
  }

  disconnect() {
    this.state = PlayerState.DISCONNECTED;
    if (this.disconnectedAt == null) {
      this.disconnectedAt = new Date();
    }
  }

  async disconnectAndPause(userLeftId: string, userRightId: string, spectatorRoom: string) {
    this.disconnect();
    this.event.emitPause(userLeftId);
    this.event.emitPause(userRightId);
    this.event.emitPause(spectatorRoom);
    // this.socket = null;
  }
}
