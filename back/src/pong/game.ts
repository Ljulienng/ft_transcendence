import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Ball } from './ball';
import { Player, PlayerState } from './player';
import { Event } from './event';
import { Repository } from 'typeorm';
import { Match } from './models/match.entity';
import { User } from 'src/user/models/user.entity';
import { Spectator } from './interfaces/spectator.interface';
import { Options } from './interfaces/options.interface';

export const WIDTH = 100;
export const HEIGHT = 66;
const FPS = 30;
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
  public spectators: Spectator[];
  public spectatorRoom: string;

  constructor(
    private userRepository: Repository<User>,
    private matchRepository: Repository<Match>,
    public event: Event,
    private ball: Ball,
    public playerLeft: Player,
    public playerRight: Player,
    public winScore: number) {
    this.state = GameState.PLAY;
    this.name = 'game_' + playerLeft.user.id + '_' + playerRight.user.id;
    this.id = null;
    this.spectators = [];
    this.spectatorRoom = 'spec_' + playerLeft.user.id + '_' + playerRight.user.id;
    this.playerLeft.socket.join(this.name);
    this.playerRight.socket.join(this.name);
    this.start();
  }

  async saveUser(userId: number, status: string, won: boolean, lost: boolean, points: number) {
    const user = await this.userRepository.findOne({ id: userId });
    if (status) { user.status = status; }
    if (won) { user.gameWon += 1; }
    if (lost) { user.gameLost += 1; }
    if (points) { user.points += points; }
    this.userRepository.save(user);
  }

  async saveMatch(winner: User, loser: User, inProgress: boolean) {
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

  findPlayer(userId: number): Player {
    if (this.playerLeft.user.id == userId) {
      return this.playerLeft;
    }
    if (this.playerRight.user.id == userId) {
      return this.playerRight;
    }
  }

  findOpponent(userId: number): Player {
    if (this.playerLeft.user.id == userId) {
      return this.playerRight;
    }
    if (this.playerRight.user.id == userId) {
      return this.playerLeft;
    }
  }

  checkForfait() {
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

  async start() {
    await this.saveUser(this.playerLeft.user.id, 'Playing', null, null, null);
    await this.saveUser(this.playerRight.user.id, 'Playing', null, null, null);
    this.sendStart();
    this.sendScore();
    this.ball.randomDirection();
    const interval = setInterval(async () => {
      if (this.state == GameState.PAUSE) {
        this.checkForfait();
      } else if (this.state == GameState.OVER) {
        clearInterval(interval);
        return;
      }
      this.ball.move(this.playerLeft, this.playerRight);
      this.ball.checkCollisions(this, this.playerLeft, this.playerRight);
    }, 1000 / FPS);
  }

  async gameOver(winner: Player) {
    const opponent: Player = this.findOpponent(winner.user.id);
    this.event.emitYouWin(winner.socket.id);
    this.event.emitYouLose(opponent.socket.id);
    await this.saveMatch(winner.user, opponent.user, false);
    await this.saveUser(winner.user.id, 'Online', true, false, winner.score); // the winner wins his goals as points
    await this.saveUser(opponent.user.id, 'Online', false, true, null);
    winner.socket.leave(this.name);
    opponent.socket.leave(this.name);
    this.setState(GameState.OVER);
    console.log(`PONG: GAME OVER ! ${winner.user.username} won the game !\n`);
  }

  async sendStart() {
    this.event.emitStart(this.playerLeft.options, this.playerLeft.socket.id, this.playerRight.user, true);
    this.event.emitStart(this.playerRight.options, this.playerRight.socket.id, this.playerLeft.user, false);
  }

  async sendScore() {
    await this.saveMatch(null, null, true);
    this.event.emitUpdateScore(this.playerLeft.socket.id, { x: this.playerLeft.score, y: this.playerRight.score });
    this.event.emitUpdateScore(this.playerRight.socket.id, { x: this.playerLeft.score, y: this.playerRight.score });
  }

  reconnectPlayer(user: User, socket: Socket) {
    const player = this.findPlayer(user.id);
    player.reconnect(user, socket);
    if (this.playerLeft.state == PlayerState.CONNECTED && this.playerRight.state == PlayerState.CONNECTED) {
      this.setState(GameState.PLAY);
      this.start();
    }
  }

  disconnectPlayer(userId: number) {
    // TODO: stop game if both are disconnected ?
    const player = this.findPlayer(userId);
    player.disconnectAndPause(this.name);
    this.setState(GameState.PAUSE);
  }

  setState(state: GameState) {
    if (this.state != GameState.OVER) {
      this.state = state;
    }
  }

  connectSpectator(spectator: Spectator) {
    this.spectators.push(spectator);
    spectator.socket.join(this.spectatorRoom);
  }
}
