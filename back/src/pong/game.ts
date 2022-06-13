import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Ball } from './ball';
import { Player, PlayerState } from './player';
import { Event } from './event';
import { Repository } from 'typeorm';
import { Match } from './models/match.entity';

export const WIDTH = 100;
export const HEIGHT = 66;
const FPS = 60;
const FORFAIT_TIMEOUT = 30;

export enum GameState {
  PLAY,
  PAUSE,
  OVER
}

@Injectable()
export class Game {

  public state: GameState;
  public name: string;
  private id: number;

  constructor(
    private matchRepository: Repository<Match>,
    private event: Event,
    private ball: Ball,
    public playerLeft: Player,
    public playerRight: Player,
    public winScore: number) {
    this.state = GameState.PLAY;
    this.name = 'game_' + playerLeft.user.username + '_' + playerRight.user.username;
    this.id = null;
    this.playerLeft.socket.join(this.name);
    this.playerRight.socket.join(this.name);
    this.start()
  }

  async saveMatch(winner: string, loser: string, inProgress: boolean) {
    let match: Match;
    if (this.id) {
      match = await this.matchRepository.findOne({ id: this.id });
      match.playerOneScore = this.playerLeft.score;
      match.playerTwoScore = this.playerRight.score;
      match.inProgress = inProgress;
    } else {
      match = this.matchRepository.create({
        playerOne: this.playerLeft.user,
        playerTwo: this.playerRight.user,
        playerOneScore: this.playerLeft.score,
        playerTwoScore: this.playerRight.score,
        inProgress: inProgress
      });
    }
    if (winner) {
      match.winner = winner;
    }
    if (loser) {
      match.loser = loser;
    }
    match = await this.matchRepository.save(match);
    this.id = match.id;
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
      if (this.state == GameState.PAUSE) {
        if (this.playerLeft.state == PlayerState.DISCONNECTED
          && new Date().getTime() - this.playerLeft.disconnectedAt.getTime() >= FORFAIT_TIMEOUT * 1000
          && (this.playerRight.state != PlayerState.DISCONNECTED
            || this.playerRight.disconnectedAt > this.playerLeft.disconnectedAt)) {
          this.gameOver(this.playerRight);
        } else if (this.playerRight.state == PlayerState.DISCONNECTED
          && new Date().getTime() - this.playerRight.disconnectedAt.getTime() >= FORFAIT_TIMEOUT * 1000
          && (this.playerLeft.state != PlayerState.DISCONNECTED
            || this.playerLeft.disconnectedAt > this.playerRight.disconnectedAt)) {
          this.gameOver(this.playerLeft);
        }
      }
      if (this.state == GameState.OVER) {
        clearInterval(interval);
        return;
      }
      if (await this.ball.move(this.playerLeft, this.playerRight) == GameState.PAUSE) {
        return;
      }
      this.ball.checkCollisions(this, this.playerLeft, this.playerRight);
    }, 1000 / FPS);
  }

  async gameOver(winner: Player) {
    const opponent: Player = this.findOpponent(winner.user.username);
    this.event.emitYouWin(winner.socket.id);
    this.event.emitYouLose(opponent.socket.id);
    await this.saveMatch(winner.user.username, opponent.user.username, false);
    winner.socket.leave(this.name);
    opponent.socket.leave(this.name);
    this.setState(GameState.OVER);
    console.log(`PONG: GAME OVER ! ${winner.user.username} won the game !\n`);
  }

  async sendStart() {
    if (await this.event.emitStart(this.playerLeft.socket.id, true) != 'ok') {
      this.playerLeft.disconnect()
      this.setState(GameState.PAUSE);
    }
    if (await this.event.emitStart(this.playerRight.socket.id, false) != 'ok') {
      this.playerRight.disconnect()
      this.setState(GameState.PAUSE);
    }
    if (this.state == GameState.PAUSE) {
      this.event.emitPause(this.name);
      return;
    }
    console.log(`\nPONG: Game '${this.name}' is starting !`);
  }

  async sendScore() {
    await this.saveMatch(null, null, true);
    if (await this.event.emitUpdateScore(this.playerLeft.socket.id, { x: this.playerLeft.score, y: this.playerRight.score }) != 'ok') {
      this.playerLeft.disconnect();
      this.setState(GameState.PAUSE);
    }
    if (await this.event.emitUpdateScore(this.playerRight.socket.id, { x: this.playerLeft.score, y: this.playerRight.score }) != 'ok') {
      this.playerRight.disconnect();
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
    player.disconnectAndPause(this.name);
    this.setState(GameState.PAUSE);
  }

  setState(state: GameState) {
    if (this.state == GameState.OVER) {
      return;
    }
    this.state = state;
  }
}