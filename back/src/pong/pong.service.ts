import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './models/match.entity';
import { User } from 'src/user/models/user.entity';
import { Game, GameState } from './game';
import { Event } from './event';
import { Player } from './player';
import { Ball } from './ball';
import { Options } from './interfaces/options.interface';

@Injectable()
export class PongService {

  public games: Game[];
  public waitingPlayers: Player[];

  constructor(
    @InjectRepository(User)
    protected userRepository: Repository<User>,
    @InjectRepository(Match)
    protected matchRepository: Repository<Match>,
  ) {
    this.games = [];
    this.waitingPlayers = [];
  }

  duel(event: Event, playerLeft: Player, playerRight: Player) { // TODO: test
    const ball = new Ball(event);
    console.log(playerLeft.user.username + ' WANTS TO FIGHT ' + playerRight.user.username);
    const game = new Game(this.userRepository, this.matchRepository, event, ball, playerLeft, playerRight, playerLeft.options.winScore);
    this.games.push(game);
  }

  matchmake(event: Event, playerLeft: Player) {
    if (this.waitingPlayers.length == 0) {
      this.waitingPlayers.push(playerLeft);
      return;
    }
    const playerRight = this.waitingPlayers.find(e => e.options.winScore == playerLeft.options.winScore && e.user.id != playerLeft.user.id);
    if (playerRight == undefined) {
      if (!this.waitingPlayers.find(e => e.user.id == playerLeft.user.id)) {
        this.waitingPlayers.push(playerLeft);
      }
      return;
    }
    this.waitingPlayers.splice(this.waitingPlayers.indexOf(playerRight), 1);
    const ball = new Ball(event);
    const game = new Game(this.userRepository, this.matchRepository, event, ball, playerLeft, playerRight, playerLeft.options.winScore);
    this.games.push(game);
  }


  findGame(userId: number): Game {
    return this.games.find(e => (e.playerLeft && e.playerLeft.user.id == userId) || (e.playerRight && e.playerRight.user.id == userId));
  }

  async getMatchHistory(user: User): Promise<Match[]> {
    return await this.matchRepository.find({
      where: [
        { playerOne: user.id },
        { playerTwo: user.id }
      ]
    });
  }
}
