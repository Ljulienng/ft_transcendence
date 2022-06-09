import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Ball } from './ball';
import { Player, PlayerState } from './player';
import { Event } from './event';

export const FPS = 60;
export const WIDTH = 100;
export const HEIGHT = 66;

export enum GameState {
  INIT,
  PLAY,
  PAUSE,
  OVER
}

@Injectable()
export class Game {

  public state: GameState;
  public name: string;

  constructor(
    private event: Event,
    private ball: Ball,
    public playerLeft: Player,
    public playerRight: Player,
    public winScore: number) {
    this.state = GameState.PLAY;
    this.name = 'game_' + playerLeft.user.username + '_' + playerRight.user.username;
    this.playerLeft.socket.join(this.name);
    this.playerRight.socket.join(this.name);
    this.start()
  }

  findPlayer(username: string): Player {
    if (this.playerLeft.user.username == username) {
      return this.playerLeft;
    } else if (this.playerRight.user.username == username) {
      return this.playerRight;
    }
  }

  findOpponent(username: string): Player {
    if (this.playerLeft.user.username == username) {
      return this.playerRight;
    } else if (this.playerRight.user.username == username) {
      return this.playerLeft;
    }
  }

  start() {
    this.sendStart();
    this.sendScore();
    this.ball.randomDirection();
    const interval = setInterval(async () => {
      if (this.state != GameState.PLAY) {
        this.event.emitPause(this.name);
        clearInterval(interval);
        return;
      }
      if (await this.ball.move(this.playerLeft, this.playerRight) == GameState.PAUSE) {
        this.event.emitPause(this.name);
        clearInterval(interval);
        return;
      }
      this.ball.checkCollisions(this, this.playerLeft, this.playerRight);
    }, 1000 / FPS);
  }

  gameOver(winner: Player) {
    const opponent: Player = this.findOpponent(winner.user.username);
    this.event.emitYouWin(winner.socket.id);
    this.event.emitYouLost(opponent.socket.id);
    winner.socket.leave(this.name);
    opponent.socket.leave(this.name);
    this.setState(GameState.OVER);
    console.log(`PONG: GAME OVER ! ${winner.user.username} won the game !\n`);
    // TODO: remove from Games in pong.service.ts
  }

  async sendStart() {
    if (await this.event.emitStart(this.playerLeft.socket.id, true) != 'ok') {
      this.playerLeft.state = PlayerState.DISCONNECTED;
      this.setState(GameState.PAUSE);
    }
    if (await this.event.emitStart(this.playerRight.socket.id, false) != 'ok') {
      this.playerRight.state = PlayerState.DISCONNECTED;
      this.setState(GameState.PAUSE);
    }
    if (this.state == GameState.PAUSE) {
      this.event.emitPause(this.name);
      return;
    }
    console.log(`\nPONG: Game '${this.name}' is starting !`);
  }

  async sendScore() {
    if (await this.event.emitUpdateScore(this.playerLeft.socket.id, { x: this.playerLeft.score, y: this.playerRight.score }) != 'ok') {
      this.playerLeft.state = PlayerState.DISCONNECTED;
      this.setState(GameState.PAUSE);
    }
    if (await this.event.emitUpdateScore(this.playerRight.socket.id, { x: this.playerLeft.score, y: this.playerRight.score }) != 'ok') {
      this.playerRight.state = PlayerState.DISCONNECTED;
      this.setState(GameState.PAUSE);
    }
  }
  
  reconnectPlayer(username: string, socket: Socket) {
    const player = this.findPlayer(username);
    player.reconnect(socket);
    if (this.playerLeft.state == PlayerState.CONNECTED && this.playerRight.state == PlayerState.CONNECTED) {
      this.setState(GameState.PLAY);
      this.start();
    }
  }

  disconnectPlayer(username: string) {
    // TODO: stop game if both are disconnected ?
    const player = this.findPlayer(username);
    player.disconnect(this.name);
    this.setState(GameState.PAUSE);
  }
  
  setState(state: GameState) {
    if (this.state == GameState.OVER) {
      return ;
    }
    this.state = state;
  }
}
