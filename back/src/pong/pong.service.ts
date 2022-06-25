import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './models/match.entity';
import { User } from 'src/user/models/user.entity';
import { Game } from './game';
import { Event } from './event';
import { Player, PlayerState } from './player';
import { Ball } from './ball';
import { UserService } from 'src/user/service/user.service';
import { SocketUserI } from 'src/user/user.gateway';

@Injectable()
export class PongService {

  public games: Game[];
  public waitingPlayers: Player[];

  constructor(
    @InjectRepository(Match)
    protected matchRepository: Repository<Match>,
    @InjectRepository(User)
    protected userRepository: Repository<User>,
    @Inject(forwardRef(() => UserService))
    protected userService: UserService
  ) {
    this.games = [];
    this.waitingPlayers = [];
  }

  duel(event: Event, playerLeft: Player, playerRight: Player, socketList: SocketUserI[]) {
    const ball = new Ball(event);
    const game = new Game(this.matchRepository, this.userRepository, this.userService, socketList, event, ball, playerLeft, playerRight, playerLeft.options.winScore);
    game.playerLeft.state = PlayerState.DISCONNECTED;
    game.playerLeft.disconnectedAt = null;
    game.playerRight.state = PlayerState.DISCONNECTED;
    game.playerLeft.disconnectedAt = null;
    this.games.push(game);
  }

  matchmake(event: Event, playerLeft: Player, socketList: SocketUserI[]) {
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
    const game = new Game(this.matchRepository, this.userRepository, this.userService, socketList, event, ball, playerLeft, playerRight, playerLeft.options.winScore);
    this.games.push(game);
  }


  findGame(userId: number): Game {
    return this.games.find(e => (e.playerLeft && e.playerLeft.user.id == userId) || (e.playerRight && e.playerRight.user.id == userId));
  }

  async getMatchHistory(user: User): Promise<Match[]> {
    const ret = await this.matchRepository.find({
      where: [
        { playerOne: user.id, inProgress: false },
        { playerTwo: user.id, inProgress: false },
      ],
      order: { id: "DESC" }
    });
    return ret;
  }
}
