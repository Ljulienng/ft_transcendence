import { Injectable } from '@nestjs/common';
import { PlayerState, Pong, PongState } from './interfaces/pong.interface';
import { Server } from 'socket.io';
import { Repository } from 'typeorm';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { User } from 'src/user/models/user.entity';
import { Match } from './models/match.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PongService {
  public pong: Pong;

  constructor(
    private schedulerRegistry: SchedulerRegistry,
		@InjectRepository(Match)
		protected matchRepository: Repository<Match>,

    ) {
    this.pong = {
      server: undefined,
      state: PongState.OFF,
      fps: 60,
      playerSize: {
        x: 100 / 100, // boardSize.x / 100 = 1
        y: 66 / 3.3   // boardSize.y / 3.3 = 20
      },
      playerLeft: {
        id: null,
        y: 33,
        score: 0,
        state: PlayerState.DISCONNECTED
      },
      playerRight: {
        id: null,
        y: 33,
        score: 0,
        state: PlayerState.DISCONNECTED
      },
      ball: {
        pos: {
          x: 50,
          y: 33
        },
        radius: 2,
        speed: {
          x: 1,
          y: 1
        },
        maxSpeed: 25
      },
      boardSize: {
        x: 100,
        y: 66
      }
    };
  }

  initServer(server: Server) {
    this.pong = {
      server: undefined,
      state: PongState.OFF,
      fps: 60,
      playerSize: {
        x: 100 / 100, // boardSize.x / 100 = 1
        y: 66 / 3.3   // boardSize.y / 3.3 = 20
      },
      playerLeft: {
        id: null,
        y: 33,
        score: 0,
        state: PlayerState.DISCONNECTED
      },
      playerRight: {
        id: null,
        y: 33,
        score: 0,
        state: PlayerState.DISCONNECTED
      },
      ball: {
        pos: {
          x: 50,
          y: 33
        },
        radius: 2,
        speed: {
          x: 1,
          y: 1
        },
        maxSpeed: 25
      },
      boardSize: {
        x: 100,
        y: 66
      }
    };
    this.pong.server = server;
    this.pong.state = PongState.ON;
    console.log('init pong');
  }

  registerPlayer(playerID: string) {
    if (this.pong.playerLeft.id == null) {
      this.pong.playerLeft.id = playerID;
    } else if (this.pong.playerRight.id == null) {
      this.pong.playerRight.id = playerID;
    } else {
      console.error('Too many player for this game.');
    }
    console.log(`player ${playerID} joined the game.`);
  }

  playerReady(playerID: string) {
    if (this.pong.playerLeft.id == playerID) {
      this.pong.playerLeft.state = PlayerState.CONNECTED;
      console.log(`Player left: ${playerID} READY !`);
    } else if (this.pong.playerRight.id == playerID) {
      this.pong.playerRight.state = PlayerState.CONNECTED;
      console.log(`Player right: ${playerID} READY !`);
    }
    if (this.pong.playerLeft.state == PlayerState.CONNECTED
        && this.pong.playerRight.state == PlayerState.CONNECTED) {
      this.start();
    }
  }

  disconnectPlayer(playerID: string) {
    console.log(`player ${playerID} left the game.`);
    if (this.pong.playerLeft.id == playerID) {
      this.pong.playerLeft.id = null;
      this.pong.playerLeft.state = PlayerState.DISCONNECTED;
    } else if (this.pong.playerRight.id == playerID) {
      this.pong.playerRight.id = null;
      this.pong.playerRight.state = PlayerState.DISCONNECTED;
    }
    this.pong.server.emit('pause');
  }

  movePlayer(playerID: string, y: number, canvasHeight: number) {
    y = y / canvasHeight * 66;
    if (this.pong.playerLeft.id == playerID) {
      this.pong.playerLeft.y = y;
      this.pong.server.to(this.pong.playerRight.id).volatile.emit('opponentMove', y);
    } else if (this.pong.playerRight.id == playerID) {
      this.pong.playerRight.y = y;
      this.pong.server.to(this.pong.playerLeft.id).volatile.emit('opponentMove', y);
    }
  }

  ballMove(pong: Pong, schedulerRegistry: SchedulerRegistry) {
    const collide = (pong: Pong, y: number, schedulerRegistry: SchedulerRegistry) => {
      if (pong.ball.pos.y < y || pong.ball.pos.y > y + pong.playerSize.y) { // player does not hit the ball
        schedulerRegistry.deleteInterval('ballMove');

        // TODO: Increment scores
        //if (pong.ball.pos.x < pong.boardSize.x / 2) {
        //  pong.playerLeft.score += 1;
        //  console.log('Left player missed the ball !');
        //} else if (pong.ball.pos.x >= pong.boardSize.x / 2) {
        //  pong.playerRight.score += 1;
        //  console.log('Right player missed the ball !');
        //}

        // TODO: Reset ball pos and speed
        //pong.ball.pos.x = pong.boardSize.x / 2;
        //pong.ball.pos.y = pong.boardSize.y / 2;
        // pong.ball.speed.x = 1;

        // Reset players pos
        //pong.playerRight.y = pong.boardSize.y / 2 - pong.playerSize.y / 2;
        //pong.playerLeft.y = pong.boardSize.y / 2 - pong.playerSize.y / 2;

      } else { // Player hit the ball
        // Increase speed and change direction
        pong.ball.speed.x *= -1.1;
        if (pong.ball.speed.x > pong.ball.maxSpeed) {
          pong.ball.speed.x = pong.ball.maxSpeed;
        } else if (pong.ball.speed.x < -pong.ball.maxSpeed) {
          pong.ball.speed.x = -pong.ball.maxSpeed;
        }

        // TODO: Add a ratio to increment ball speed depending on the paddle impact position
        //const impact = pong.ball.pos.y - y - pong.playerSize.y / 2;
        //const ratio = 100 / (pong.playerSize.y / 2);
        //pong.ball.speed.y = Math.round(impact * ratio / 200);
        //if (pong.ball.speed.y > pong.ball.maxSpeed) {
        //  pong.ball.speed.y = pong.ball.maxSpeed;
        //} else if (pong.ball.speed.y < -pong.ball.maxSpeed) {
        //  pong.ball.speed.y = -pong.ball.maxSpeed;
        //}
      }
    };

    // Rebounds on top and bottom
    if (pong.ball.pos.y > pong.boardSize.y || pong.ball.pos.y < 0) {
      pong.ball.speed.y *= -1;
    }
    // Update ball pos
    pong.ball.pos.x += pong.ball.speed.x;
    pong.ball.pos.y += pong.ball.speed.y;
    pong.server.emit('ballMove', pong.ball.pos);

    // Check collisions with players
    if (pong.ball.pos.x < pong.playerSize.x) {
      collide(pong, pong.playerLeft.y, schedulerRegistry);
    } else if (pong.ball.pos.x > pong.boardSize.x - pong.playerSize.x) {
      collide(pong, pong.playerRight.y, schedulerRegistry);
    }
  }

  start() {
    this.pong.server.to(this.pong.playerLeft.id).emit('start', true);
    this.pong.server.to(this.pong.playerRight.id).emit('start', false);
    console.log('starting game !');
    const interval = setInterval(this.ballMove, 1000 / this.pong.fps, this.pong, this.schedulerRegistry);
    this.schedulerRegistry.addInterval('ballMove', interval);
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
    })
  }
}
