import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from 'socket.io';
import { Game } from './models/game.entity';
import { User } from 'src/user/models/user.entity';
import { Pong, SocketPlayer } from './interfaces/pong.interface';

@Injectable()
export class PongService {
  private pong: Pong;

  constructor(@InjectRepository(Game) protected gameRepository: Repository<Game>) {
    this.resetPong();
  }

  resetPong() {
    this.pong = {
      server: undefined,
      // state: PongState.OFF,
      interval: null,
      fps: 60,
      playerSize: {
        x: 100 / 100, // boardSize.x / 100 = 1
        y: 66 / 3.3   // boardSize.y / 3.3 = 20
      },
      boardSize: {
        x: 100,
        y: 66
      },
      winScore: 3,
      playerLeft: {
        socket: null,
        user: null,
        y: 33,
        score: 0,
        // state: PlayerState.DISCONNECTED
      },
      playerRight: {
        socket: null,
        user: null,
        y: 33,
        score: 0,
        // state: PlayerState.DISCONNECTED
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
      }
    };
  }

  initServer(server: Server) {
    this.resetPong();
    this.pong.server = server;
    // this.pong.state = PongState.ON;
    console.log('init pong');
  }

  // registerPlayer(socketUser: SocketPlayer) {
  //   // TODO: should be handled by rooms
  //   if (this.pong.playerLeft.socket == null) {
  //     this.pong.playerLeft.socket = socketUser;
  //   } else if (this.pong.playerRight.socket == null) {
  //     this.pong.playerRight.socket = socketUser;
  //   } else {
  //     console.error('PONG: Too many player for this game.');
  //   }
  //   console.log(`PONG: player ${socketUser.user.username} joined the game.`);
  // }

  // playerReady(id: string) {
  //   if (this.pong.playerLeft.socket && this.pong.playerLeft.socket.socketId == id) {
  //     this.pong.playerLeft.state = PlayerState.CONNECTED;
  //     console.log(`PONG: Player left: ${this.pong.playerLeft.socket.user.username} READY !`);
  //   } else if (this.pong.playerRight.socket && this.pong.playerRight.socket.socketId == id) {
  //     this.pong.playerRight.state = PlayerState.CONNECTED;
  //     console.log(`PONG: Player right: ${this.pong.playerRight.socket.user.username} READY !`);
  //   }
  //   if (this.pong.playerLeft.state == PlayerState.CONNECTED && this.pong.playerRight.state == PlayerState.CONNECTED) {
  //     this.start();
  //   }
  // }

  matchmake(waitingList: SocketPlayer[]): [SocketPlayer, SocketPlayer] {
    const players: [SocketPlayer, SocketPlayer] = [null, null];
    if (waitingList.length < 2) {
      return (players);
    }
    players[0] = waitingList.shift();
    players[1] = waitingList.shift();
    players[0].socket.join('game' + players[0].socket.id.substring(0, 5) + players[1].socket.id.substring(0, 5));
    players[1].socket.join('game' + players[0].socket.id.substring(0, 5) + players[1].socket.id.substring(0, 5));
    return (players);
  }

  disconnectPlayer(socketPlayer: SocketPlayer) {
    // if (socketPlayer.user)
      // console.log(`PONG: player ${socketPlayer.user.username} left the game.`);
    // TODO: if game is over disconnect else pause game
    //if (this.pong.playerLeft.socket && this.pong.playerLeft.socket.id == socketPlayer.socket.id) {
    //  this.pong.playerLeft.socket = null;
    //  this.pong.playerLeft.user = null;
    //  // this.pong.playerLeft.state = PlayerState.DISCONNECTED;
    //} else if (this.pong.playerRight.socket && this.pong.playerRight.socket.id == socketPlayer.socket.id) {
    //  this.pong.playerRight.socket = null;
    //  this.pong.playerRight.user = null;
    //  // this.pong.playerRight.state = PlayerState.DISCONNECTED;
    //}
    //this.pong.server.emit('pause');
  }

  movePlayer(id: string, y: number, canvasHeight: number) {
    y = y / canvasHeight * 66;
    if (this.pong.playerLeft.socket.id == id) {
      this.pong.playerLeft.y = y;
      this.pong.server.to(this.pong.playerRight.socket.id).volatile.emit('opponentMove', y);
    } else if (this.pong.playerRight.socket.id == id) {
      this.pong.playerRight.y = y;
      this.pong.server.to(this.pong.playerLeft.socket.id).volatile.emit('opponentMove', y);
    }
  }

  collide(y: number) {
    if (this.pong.ball.pos.y < y || this.pong.ball.pos.y > y + this.pong.playerSize.y) { // player does not hit the ball
      this.pong.ball.speed.x = 0;
      this.pong.ball.speed.y = 0;

      if (this.pong.ball.pos.x < this.pong.boardSize.x / 2) {
        console.log('PONG: left player (' + this.pong.playerLeft.user.username + ') missed the ball !');
        this.pong.playerRight.score += 1;
        if (this.pong.playerRight.score >= this.pong.winScore) {
          clearInterval(this.pong.interval);
          console.log('PONG: right player (' + this.pong.playerRight.user.username + ') won the game !');
          this.pong.server.to(this.pong.playerRight.socket.id).emit('youWin');
          this.pong.server.to(this.pong.playerLeft.socket.id).emit('youLost');
          // TODO: leave room
          return this.initServer(this.pong.server);
        }
      } else if (this.pong.ball.pos.x >= this.pong.boardSize.x / 2) {
        console.log('PONG: right player (' + this.pong.playerRight.user.username + ') missed the ball !');
        this.pong.playerLeft.score += 1;
        if (this.pong.playerLeft.score >= this.pong.winScore) {
          clearInterval(this.pong.interval);
          console.log('PONG: left player (' + this.pong.playerLeft.user.username + ') won the game !');
          this.pong.server.to(this.pong.playerLeft.socket.id).emit('youWin');
          this.pong.server.to(this.pong.playerRight.socket.id).emit('youLost');
          // TODO: leave room
          return this.initServer(this.pong.server);
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

  start(playerLeft: SocketPlayer, playerRight: SocketPlayer, winScore: number) {
    this.pong.playerLeft.socket = playerLeft.socket;
    this.pong.playerLeft.user = playerLeft.user;
    this.pong.playerRight.socket = playerRight.socket;
    this.pong.playerRight.user = playerRight.user;
    this.pong.winScore = winScore;

    this.pong.server.to(this.pong.playerLeft.socket.id).emit('start', true);
    this.pong.server.to(this.pong.playerRight.socket.id).emit('start', false);

    console.log('PONG: Game \'game' + playerLeft.socket.id.substring(0, 5) + playerRight.socket.id.substring(0, 5) + '\' is starting !');

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
