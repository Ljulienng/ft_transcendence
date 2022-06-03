import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from 'socket.io';
import { Game } from './models/game.entity';
import { User } from 'src/user/models/user.entity';
import { SocketUserI } from 'src/chat/chat.gateway';
import { PlayerState, Pong, PongState } from './interfaces/pong.interface';

@Injectable()
export class PongService {
  private pong: Pong;

  constructor(
    @InjectRepository(Game)
    protected gameRepository: Repository<Game>,
    private schedulerRegistry: SchedulerRegistry
  ) {
    this.resetPong();
  }

  resetPong() {
    this.pong = {
      server: undefined,
      state: PongState.OFF,
      fps: 60,
      playerSize: {
        x: 100 / 100, // boardSize.x / 100 = 1
        y: 66 / 3.3   // boardSize.y / 3.3 = 20
      },
      playerLeft: {
        socket: null,
        y: 33,
        score: 0,
        state: PlayerState.DISCONNECTED
      },
      playerRight: {
        socket: null,
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
      },
      winScore: 3,
      interval: null
    };
  }

  initServer(server: Server) {
    this.resetPong();
    this.pong.server = server;
    this.pong.state = PongState.ON;
    console.log('init pong');
  }

  registerPlayer(socketUser: SocketUserI) {
    // TODO: should be handled by rooms
    if (this.pong.playerLeft.socket == null) {
      this.pong.playerLeft.socket = socketUser;
    } else if (this.pong.playerRight.socket == null) {
      this.pong.playerRight.socket = socketUser;
    } else {
      console.error('PONG: Too many player for this game.');
    }
    console.log(`PONG: player ${socketUser.user.username} joined the game.`);
  }

  playerReady(id: string) {
    if (this.pong.playerLeft.socket && this.pong.playerLeft.socket.socketId == id) {
      this.pong.playerLeft.state = PlayerState.CONNECTED;
      console.log(`PONG: Player left: ${this.pong.playerLeft.socket.user.username} READY !`);
    } else if (this.pong.playerRight.socket && this.pong.playerRight.socket.socketId == id) {
      this.pong.playerRight.state = PlayerState.CONNECTED;
      console.log(`PONG: Player right: ${this.pong.playerRight.socket.user.username} READY !`);
    }
    if (this.pong.playerLeft.state == PlayerState.CONNECTED && this.pong.playerRight.state == PlayerState.CONNECTED) {
      this.start();
    }
  }

  disconnectPlayer(socketUser: SocketUserI) {
    console.log(`PONG: player ${socketUser.user.username} left the game.`);

    // TODO: if game is over disconnect else pause game

    if (this.pong.playerLeft.socket && this.pong.playerLeft.socket.socketId == socketUser.socketId) {
      this.pong.playerLeft.socket = null;
      this.pong.playerLeft.state = PlayerState.DISCONNECTED;
    } else if (this.pong.playerRight.socket && this.pong.playerRight.socket.socketId == socketUser.socketId) {
      this.pong.playerRight.socket = null;
      this.pong.playerRight.state = PlayerState.DISCONNECTED;
    }
    this.pong.server.emit('pause');
  }

  movePlayer(id: string, y: number, canvasHeight: number) {
    y = y / canvasHeight * 66;
    if (this.pong.playerLeft.socket.socketId == id) {
      this.pong.playerLeft.y = y;
      this.pong.server.to(this.pong.playerRight.socket.socketId).volatile.emit('opponentMove', y);
    } else if (this.pong.playerRight.socket.socketId == id) {
      this.pong.playerRight.y = y;
      this.pong.server.to(this.pong.playerLeft.socket.socketId).volatile.emit('opponentMove', y);
    }
  }
  /*
    ballMove(pong: Pong, schedulerRegistry: SchedulerRegistry) {
      const collide = (pong: Pong, y: number, schedulerRegistry: SchedulerRegistry) => {
        if (pong.ball.pos.y < y || pong.ball.pos.y > y + pong.playerSize.y) { // player does not hit the ball
          schedulerRegistry.deleteInterval('ballMove');
          pong.playerLeft.state = PlayerState.DISCONNECTED;
          pong.playerRight.state = PlayerState.DISCONNECTED;
  
          if (pong.ball.pos.x < pong.boardSize.x / 2) {
            console.log('PONG: left player (' + pong.playerLeft.socket.user.username + ') missed the ball !');
            pong.playerRight.score += 1;
            if (pong.playerRight.score == pong.winScore) {
              console.log('PONG: right player (' + pong.playerRight.socket.user.username + ') won the game !');
              // TODO: stop game because it's over
            }
          } else if (pong.ball.pos.x >= pong.boardSize.x / 2) {
            console.log('PONG: right player (' + pong.playerRight.socket.user.username + ') missed the ball !');
            pong.playerLeft.score += 1;
            if (pong.playerLeft.score == pong.winScore) {
              console.log('PONG: left player (' + pong.playerLeft.socket.user.username + ') won the game !');
              // TODO: stop game because it's over
            }
          }
  
          // Scores
          pong.server.emit('updateScore', {x: pong.playerLeft.score, y: pong.playerRight.score});
  
          // Reset ball pos and speed
          pong.ball.pos.x = pong.boardSize.x / 2;
          pong.ball.pos.y = pong.boardSize.y / 2;
          pong.ball.speed.x = 1;
          pong.ball.speed.y = 1;
  
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
    */

  collide(y: number) {
    if (this.pong.ball.pos.y < y || this.pong.ball.pos.y > y + this.pong.playerSize.y) { // player does not hit the ball
      // clearInterval(this.pong.interval);
      this.pong.playerLeft.state = PlayerState.DISCONNECTED;
      this.pong.playerRight.state = PlayerState.DISCONNECTED;

      if (this.pong.ball.pos.x < this.pong.boardSize.x / 2) {
        console.log('PONG: left player (' + this.pong.playerLeft.socket.user.username + ') missed the ball !');
        this.pong.playerRight.score += 1;
        if (this.pong.playerRight.score == this.pong.winScore) {
          console.log('PONG: right player (' + this.pong.playerRight.socket.user.username + ') won the game !');
          clearInterval(this.pong.interval);
          // TODO: stop game because it's over
        }
      } else if (this.pong.ball.pos.x >= this.pong.boardSize.x / 2) {
        console.log('PONG: right player (' + this.pong.playerRight.socket.user.username + ') missed the ball !');
        this.pong.playerLeft.score += 1;
        if (this.pong.playerLeft.score == this.pong.winScore) {
          console.log('PONG: left player (' + this.pong.playerLeft.socket.user.username + ') won the game !');
          clearInterval(this.pong.interval);
          // TODO: stop game because it's over
        }
      }

      // Scores
      this.pong.server.emit('updateScore', { x: this.pong.playerLeft.score, y: this.pong.playerRight.score });

      // Reset ball pos and speed
      this.pong.ball.pos.x = this.pong.boardSize.x / 2;
      this.pong.ball.pos.y = this.pong.boardSize.y / 2;
      this.pong.ball.speed.x = 1;
      this.pong.ball.speed.y = 1;

      // Reset players pos
      //this.pong.playerRight.y = this.pong.boardSize.y / 2 - this.pong.playerSize.y / 2;
      //this.pong.playerLeft.y = this.pong.boardSize.y / 2 - this.pong.playerSize.y / 2;

    } else { // Player hit the ball
      // Increase speed and change direction
      this.pong.ball.speed.x *= -1.1;
      if (this.pong.ball.speed.x > this.pong.ball.maxSpeed) {
        this.pong.ball.speed.x = this.pong.ball.maxSpeed;
      } else if (this.pong.ball.speed.x < -this.pong.ball.maxSpeed) {
        this.pong.ball.speed.x = -this.pong.ball.maxSpeed;
      }

      // TODO: Add a ratio to increment ball speed depending on the paddle impact position
      //const impact = this.pong.ball.pos.y - y - this.pong.playerSize.y / 2;
      //const ratio = 100 / (this.pong.playerSize.y / 2);
      //this.pong.ball.speed.y = Math.round(impact * ratio / 200);
      //if (this.pong.ball.speed.y > this.pong.ball.maxSpeed) {
      //  this.pong.ball.speed.y = this.pong.ball.maxSpeed;
      //} else if (this.pong.ball.speed.y < -this.pong.ball.maxSpeed) {
      //  this.pong.ball.speed.y = -this.pong.ball.maxSpeed;
      //}
    }
  }

  start() {
    this.pong.server.to(this.pong.playerLeft.socket.socketId).emit('start', true);
    this.pong.server.to(this.pong.playerRight.socket.socketId).emit('start', false);
    console.log('PONG: Game is starting !');
    this.pong.interval = setInterval(() => {
      // Rebounds on top and bottom
      if (this.pong.ball.pos.y > this.pong.boardSize.y || this.pong.ball.pos.y < 0) {
        this.pong.ball.speed.y *= -1;
      }
      // Update ball pos
      this.pong.ball.pos.x += this.pong.ball.speed.x;
      this.pong.ball.pos.y += this.pong.ball.speed.y;
      this.pong.server.emit('ballMove', this.pong.ball.pos);

      // Check collisions with players
      if (this.pong.ball.pos.x < this.pong.playerSize.x) {
        this.collide(this.pong.playerLeft.y);
      } else if (this.pong.ball.pos.x > this.pong.boardSize.x - this.pong.playerSize.x) {
        this.collide(this.pong.playerRight.y);
      }
    }, 1000 / this.pong.fps);
    // this.schedulerRegistry.addInterval('ballMove', interval);
  }

  async getGames(user: User) {
    return await this.gameRepository.find({
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
