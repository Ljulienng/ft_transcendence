import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './models/match.entity';
import { User } from 'src/user/models/user.entity';
import { Game } from './game';
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
    const options = {
      bgColor: '#1c1d21',
      fgColor: 'lightgrey',
      winScore: 5
    };
    this.games.push(new Game(this.userRepository, this.matchRepository, event, ball, playerLeft, playerRight, options)); // TODO: dynamic winScore
  }

  matchmake(event: Event, playerLeft: Player, options: Options) {
    // TODO: smarter matchmaking
    if (!this.waitingPlayers.length) {
      this.waitingPlayers.push(playerLeft);
      return;
    }
    const playerRight = this.waitingPlayers.shift();
    const ball = new Ball(event);
    this.games.push(new Game(this.userRepository, this.matchRepository, event, ball, playerLeft, playerRight, options)); // TODO: dynamic winScore
  }

  findGame(userId: number): Game {
    return this.games.find(e => (e.playerLeft && e.playerLeft.user.id == userId) || (e.playerRight && e.playerRight.user.id == userId));
  }

  async getMatchHistory(user: User): Promise<Match[]> {
    return await this.matchRepository.find({
      where: [
        { playerOne: user },
        { playerTwo: user }
      ]
    });
  }
}
