import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './models/match.entity';
import { User } from 'src/user/models/user.entity';
import { Game } from './game';
import { Event } from './event';
import { Player } from './player';
import { Ball } from './ball';

@Injectable()
export class PongService {

  public games: Game[];
  public waitingPlayers: Player[];

  constructor(
    @InjectRepository(Match)
    protected matchRepository: Repository<Match>,
  ) {
    this.games = [];
    this.waitingPlayers = [];
  }

  matchmake(event: Event, playerLeft: Player) {
    // TODO: smarter matchmaking
    if (!this.waitingPlayers.length) {
      this.waitingPlayers.push(playerLeft);
      return;
    }
    const playerRight = this.waitingPlayers.shift();
    const ball = new Ball(event);
    this.games.push(new Game(event, ball, playerLeft, playerRight, 5)); // TODO: dynamic winScore
  }

  findGame(username: string): Game {
    return this.games.find(e => (e.playerLeft && e.playerLeft.user.username == username) || (e.playerRight && e.playerRight.user.username == username));
  }

  async getMatchHistory(user: User) {
    return await this.matchRepository.find({
      where: [
        {
          playerOne: user
        },
        {
          playerTwo: user
        }
      ]
    });
  }

}
