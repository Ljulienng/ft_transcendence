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

  constructor(
    private event: Event,
    public socket: Socket,
    public user: User) {
    Player.size = { x: WIDTH / 100, y: HEIGHT / 3.3 };
    this.y = HEIGHT / 2 - Player.size.y / 2;  // TODO: + or - ?
    this.score = 0;
    this.state = PlayerState.CONNECTED;
  }

  async move(opponent: Player, y: number, canvasHeight: number): Promise<GameState> {
    y = y / canvasHeight * HEIGHT;
    this.y = y;
    if (await this.event.emitOpponentMove(opponent.socket.id, y) != 'ok') {
      opponent.state = PlayerState.DISCONNECTED;
      return GameState.PAUSE;
    }
    else {
      return GameState.PLAY;
    }
  }

  goal(game: Game) {
    this.score += 1;
    game.sendScore();
    if (this.score >= game.winScore) {
      game.gameOver(this);
    }
  }

  connect(socket: Socket) {
    this.socket = socket;
    this.state = PlayerState.CONNECTED;
  }

  disconnect(gameId: string) {
    this.state = PlayerState.DISCONNECTED;
    this.event.emitPause(gameId);
  }

}
