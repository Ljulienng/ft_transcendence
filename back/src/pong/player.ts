import { Injectable } from '@nestjs/common';
import { User } from 'src/user/models/user.entity';
import { Game, GameState, HEIGHT, WIDTH } from './game';
import { Point } from './interfaces/point.interface';
import { Socket } from 'socket.io'
import { Event } from './event';

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
    public user: User) {
    Player.size = { x: WIDTH / 100, y: HEIGHT / 3.3 };
    this.y = HEIGHT / 2 - Player.size.y / 2;
    this.score = 0;
    this.state = PlayerState.CONNECTED;
    this.disconnectedAt = null;
  }

  async move(opponent: Player, y: number, canvasHeight: number): Promise<GameState> {
    y = y / canvasHeight * HEIGHT;
    this.y = y;
    if (await this.event.emitOpponentMove(opponent.socket.id, y) != 'ok') {
      opponent.disconnect();
      return GameState.PAUSE;
    }
    else {
      return GameState.PLAY;
    }
  }

  goal(game: Game) {
    this.score += 1;
    game.sendScore();
    if (this.score >= game.options.winScore) {
      game.gameOver(this);
    }
  }

  reconnect(socket: Socket) {
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

  disconnectAndPause(gameId: string) {
    this.disconnect();
    this.event.emitPause(gameId);
  }

}
