import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from 'socket.io';
import { Game } from './models/game.entity';
import { User } from 'src/user/models/user.entity';
import { PlayerState, Pong, PongState, SocketPlayer } from './interfaces/pong.interface';

@Injectable()
export class PongService {
  private pong: Pong;
  private playingList: SocketPlayer[];

  constructor(@InjectRepository(Game) protected gameRepository: Repository<Game>) {
    this.playingList = [];
    this.resetPong();
  }

  getPlayingList() {
    return this.playingList;
  }

  resetPong() {
    this.pong = {
      name: null,
      server: null,
      state: PongState.INIT,
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
      winScore: 5,
      playerLeft: {
        socket: null,
        user: null,
        y: 33,
        score: 0,
        state: PlayerState.DISCONNECTED
      },
      playerRight: {
        socket: null,
        user: null,
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
      }
    };
  }

  initServer(server: Server) {
    this.resetPong();
    this.pong.server = server;
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

  playerReady(socketPlayer: SocketPlayer) {
    if (this.pong.playerLeft.user && this.pong.playerLeft.user.username == socketPlayer.user.username) {
      this.pong.playerLeft.socket = socketPlayer.socket;
      this.pong.playerLeft.state = PlayerState.CONNECTED;
      console.log(`PONG: Player left: ${this.pong.playerRight.user.username} READY !`);
    } else if (this.pong.playerRight.user && this.pong.playerRight.user.username == socketPlayer.user.username) {
      this.pong.playerRight.socket = socketPlayer.socket;
      this.pong.playerRight.state = PlayerState.CONNECTED;
      console.log(`PONG: Player right: ${this.pong.playerRight.user.username} READY !`);
    } else {
      console.error(`The player ${socketPlayer.user.username} that says is ready is not is the game.`);
      if (this.pong.playerLeft.user) {
        console.error(`PlayerLeft: ${this.pong.playerLeft.user.username}`);
      }
      if (this.pong.playerRight.user) {
        console.error(`PlayerRight: ${this.pong.playerRight.user.username}`);
      }
    }
    console.log(`GAME: state is`, this.pong.state, this.pong.playerLeft.state, this.pong.playerRight.state);
    if (this.pong.playerLeft.state == PlayerState.CONNECTED && this.pong.playerRight.state == PlayerState.CONNECTED) {
      if (this.pong.state != PongState.PLAY) {
        console.log(`PONG: Game ${this.pong.name} resuming`);
        this.start(this.pong.playerLeft, this.pong.playerRight, this.pong.winScore);
      }
    }
  }

  matchmake(waitingList: SocketPlayer[]): [SocketPlayer, SocketPlayer] {
    const players: [SocketPlayer, SocketPlayer] = [null, null];
    if (waitingList.length < 2) {
      return (players);
    }
 
    players[0] = waitingList.shift();
    this.playingList.push(players[0]);

    players[1] = waitingList.shift();
    this.playingList.push(players[1]);

    players[0].socket.join('game_' + players[0].user.username + '_' + players[1].user.username);
    players[1].socket.join('game_' + players[0].user.username + '_' + players[1].user.username);
    return (players);
  }

  disconnectPlayer(socketPlayer: SocketPlayer) {
     if (socketPlayer.user) {
       console.log(`PONG: player ${socketPlayer.user.username} left the game.`);
     }
    if (this.pong.playerLeft.user && this.pong.playerLeft.user.username == socketPlayer.user.username) {
      this.pong.playerLeft.socket = null;
      this.pong.playerLeft.user = null;
      this.pong.playerLeft.state = PlayerState.DISCONNECTED;
    } else if (this.pong.playerRight.user && this.pong.playerRight.user.username == socketPlayer.user.username) {
      this.pong.playerRight.socket = null;
      this.pong.playerRight.user = null;
      this.pong.playerRight.state = PlayerState.DISCONNECTED;
    }
    if (this.pong.state == PongState.PLAY) {
      this.pong.state = PongState.PAUSE
    }
    this.pong.server.to(this.pong.name).emit('pause');
  }

  movePlayer(id: string, y: number, canvasHeight: number) {
    y = y / canvasHeight * 66;
    if (this.pong.playerLeft.socket.id == id) {
      this.pong.playerLeft.y = y;
      this.pong.server.timeout(1000).to(this.pong.playerRight.socket.id).emit('opponentMove', y, (err: Error, response: string) => {
        if (err || response != 'ok') {
          console.log('pause when opponentMove');
          this.pong.playerRight.state = PlayerState.DISCONNECTED;
          this.pong.state = PongState.PAUSE;
          console.log(`GAME: state is`, this.pong.state, this.pong.playerLeft.state, this.pong.playerRight.state);
        }
      });
    } else if (this.pong.playerRight.socket.id == id) {
      this.pong.playerRight.y = y;
      this.pong.server.timeout(1000).to(this.pong.playerLeft.socket.id).emit('opponentMove', y, (err: Error, response: string) => {
        if (err || response != 'ok') {
          console.log('pause when opponentMove');
          this.pong.playerLeft.state = PlayerState.DISCONNECTED;
          this.pong.state = PongState.PAUSE;
          console.log(`GAME: state is`, this.pong.state, this.pong.playerLeft.state, this.pong.playerRight.state);
        }
      });
    }
  }

  randomBallDirection() {
    this.pong.ball.speed.x = ((Math.random() * (100 - 45) + 45) / 100) * (Math.round(Math.random()) ? 1 : -1);
    this.pong.ball.speed.y = ((Math.random() * (100 - 45) + 45) / 100) * (Math.round(Math.random()) ? 1 : -1);
  }

  collide(y: number) {
    if (this.pong.ball.pos.y < y || this.pong.ball.pos.y > y + this.pong.playerSize.y) { // player does not hit the ball
      this.pong.ball.speed.x = 0;
      this.pong.ball.speed.y = 0;

      if (this.pong.ball.pos.x < this.pong.boardSize.x / 2) { // PlayerLeft missed the ball
        console.log('PONG: left player (' + this.pong.playerLeft.user.username + ') missed the ball !');
        this.pong.playerRight.score += 1;
        if (this.pong.playerRight.score >= this.pong.winScore) {
          clearInterval(this.pong.interval);
          console.log('PONG: right player (' + this.pong.playerRight.user.username + ') won the game !');
          this.pong.server.to(this.pong.playerRight.socket.id).emit('youWin');
          this.pong.server.to(this.pong.playerLeft.socket.id).emit('youLost');
          this.pong.playerLeft.socket.leave(this.pong.name);
          this.pong.playerRight.socket.leave(this.pong.name);
          this.playingList = this.playingList.filter(e => e.user.username != this.pong.playerLeft.user.username && e.user.username != this.pong.playerRight.user.username);
          console.log(`PONG: Game '${this.pong.name}' is over !\n`);
          this.pong.state = PongState.OVER;
          return ;
          // return this.initServer(this.pong.server); // TODO: ?
        }
      } else if (this.pong.ball.pos.x >= this.pong.boardSize.x / 2) { // PLayerRight missed the ball
        console.log('PONG: right player (' + this.pong.playerRight.user.username + ') missed the ball !');
        this.pong.playerLeft.score += 1;
        if (this.pong.playerLeft.score >= this.pong.winScore) {
          clearInterval(this.pong.interval);
          console.log('PONG: left player (' + this.pong.playerLeft.user.username + ') won the game !');
          this.pong.server.to(this.pong.playerLeft.socket.id).emit('youWin');
          this.pong.server.to(this.pong.playerRight.socket.id).emit('youLost');
          this.pong.playerLeft.socket.leave(this.pong.name);
          this.pong.playerRight.socket.leave(this.pong.name);
          this.playingList = this.playingList.filter(e => e.user.username != this.pong.playerLeft.user.username && e.user.username != this.pong.playerRight.user.username);
          console.log(`PONG: Game '${this.pong.name}' is over !\n`);
          this.pong.state = PongState.OVER;
          return ;
          // return this.initServer(this.pong.server); // TODO: ?
        }
      }

      // Scores
      this.pong.server.timeout(1000).to(this.pong.playerLeft.socket.id).emit('updateScore', { x: this.pong.playerLeft.score, y: this.pong.playerRight.score }, (err: Error, response: string) => {
        if (err || response != 'ok') {
          console.log('pause when updateScore');
          this.pong.playerLeft.state = PlayerState.DISCONNECTED;
          this.pong.state = PongState.PAUSE;
          console.log(`GAME: state is`, this.pong.state, this.pong.playerLeft.state, this.pong.playerRight.state);
        }
      });
      this.pong.server.timeout(1000).to(this.pong.playerRight.socket.id).emit('updateScore', { x: this.pong.playerLeft.score, y: this.pong.playerRight.score }, (err: Error, response: string) => {
        if (err || response != 'ok') {
          console.log('pause when updateScore');
          this.pong.playerRight.state = PlayerState.DISCONNECTED;
          this.pong.state = PongState.PAUSE;
          console.log(`GAME: state is`, this.pong.state, this.pong.playerLeft.state, this.pong.playerRight.state);
        }
      });
      // TODO: send score to other persons in room (like spectators)

      // Reset ball pos and speed
      this.pong.ball.pos.x = this.pong.boardSize.x / 2;
      this.pong.ball.pos.y = this.pong.boardSize.y / 2;
      this.randomBallDirection();

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

      // Add a ratio to increment ball speed depending on the paddle impact position
      const impact = this.pong.ball.pos.y - y - this.pong.playerSize.y / 2;
      const ratio = 100 / (this.pong.playerSize.y / 2);
      this.pong.ball.speed.y = Math.round(impact * ratio / 50);
      if (this.pong.ball.speed.y > this.pong.ball.maxSpeed) {
        this.pong.ball.speed.y = this.pong.ball.maxSpeed;
      } else if (this.pong.ball.speed.y < -this.pong.ball.maxSpeed) {
        this.pong.ball.speed.y = -this.pong.ball.maxSpeed;
      }
    }
  }
  
  sendStart(id: string, isLeftPlayer: boolean): Promise<string> {
    return new Promise(resolve => this.pong.server.timeout(1000).to(id).emit('start', isLeftPlayer, (err: Error, response: string) => {
        if (err || response != 'ok') {
          console.log('pause when sending start', id, this.pong.playerLeft.socket.id, this.pong.playerRight.socket.id);
          if (this.pong.playerLeft.socket.id == id) {
            this.pong.playerLeft.state = PlayerState.DISCONNECTED;
          } else if (this.pong.playerRight.socket.id == id) {
            this.pong.playerRight.state = PlayerState.DISCONNECTED;
          } else {
            console.log('I do not know who has just disconnect..');
          }
          console.log('pause when sending start', id, this.pong.playerLeft.socket.id, this.pong.playerRight.socket.id);
          this.pong.state = PongState.PAUSE;
          console.log(`GAME: state is`, this.pong.state, this.pong.playerLeft.state, this.pong.playerRight.state);
        }
        resolve(response);
    }));
  }

  sendBallMove(id: string): Promise<string> {
    return new Promise(resolve => this.pong.server.timeout(1000).to(id).emit('ballMove', this.pong.ball.pos, (err: Error, response: string) => {
        if (err || response != 'ok') {
          console.log('pause when sending ballPos', id, this.pong.playerLeft.socket.id, this.pong.playerRight.socket.id);
          if (this.pong.playerLeft.socket.id == id) {
            console.log('disconnecting player LEFT');
            this.pong.playerLeft.state = PlayerState.DISCONNECTED;
          } else if (this.pong.playerRight.socket.id == id) {
            console.log('disconnecting player RIGHT');
            this.pong.playerRight.state = PlayerState.DISCONNECTED;
          } else {
            console.log('I do not know who has just disconnect..');
          }
          console.log('pause when sending ballPos', id, this.pong.playerLeft.socket.id, this.pong.playerRight.socket.id);
          this.pong.state = PongState.PAUSE;
          console.log(`GAME: state is`, this.pong.state, this.pong.playerLeft.state, this.pong.playerRight.state);
        }
        resolve(response);
    }));
      // TODO: emit ballMove to everyone else in room but do not pause game for them
  }

  async start(playerLeft: SocketPlayer, playerRight: SocketPlayer, winScore: number) {
    this.pong.playerLeft.socket = playerLeft.socket;
    this.pong.playerLeft.user = playerLeft.user;
    this.pong.playerLeft.state = PlayerState.CONNECTED;

    this.pong.playerRight.socket = playerRight.socket;
    this.pong.playerRight.user = playerRight.user;
    this.pong.playerRight.state = PlayerState.CONNECTED;

    this.pong.winScore = winScore;
    this.pong.name = 'game_' + this.pong.playerLeft.user.username + '_' + this.pong.playerRight.user.username;
    this.pong.state = PongState.PLAY;

    await this.sendStart(this.pong.playerLeft.socket.id, true);
    await this.sendStart(this.pong.playerRight.socket.id, false);
    if (this.pong.state != PongState.PLAY) {
      this.pong.server.to(this.pong.name).emit('pause');
      console.log('cannot start because pause');
      return ;
    }

    console.log(`\nPONG: Game '${this.pong.name}' is starting !`);
    console.log(`GAME: state is`, this.pong.state, this.pong.playerLeft.state, this.pong.playerRight.state);
    this.randomBallDirection();
    this.pong.interval = setInterval(async () => {
      if (this.pong.state != PongState.PLAY) {
        this.pong.server.to(this.pong.name).emit('pause');
        console.log('cannot loop because ' + this.pong.state);
        clearInterval(this.pong.interval);
        return ;
      }
      // Rebounds on top and bottom
      if (this.pong.ball.pos.y > this.pong.boardSize.y || this.pong.ball.pos.y < 0) {
        this.pong.ball.speed.y *= -1;
      }
      // Update ball pos
      this.pong.ball.pos.x += this.pong.ball.speed.x;
      this.pong.ball.pos.y += this.pong.ball.speed.y;
      //this.pong.server.timeout(1000).to(this.pong.playerLeft.socket.id).emit('ballMove', this.pong.ball.pos, (err: Error, response: string) => {
      //  if (err || response != 'ok') {
      //    console.log('pause when ballMove 1', err, response);
      //    this.pong.playerLeft.state = PlayerState.DISCONNECTED;
      //    this.pong.state = PongState.PAUSE;
      //    console.log(`GAME: state is`, this.pong.state, this.pong.playerLeft.state, this.pong.playerRight.state);
      //  }
      //});
      //this.pong.server.timeout(1000).to(this.pong.playerRight.socket.id).emit('ballMove', this.pong.ball.pos, (err: Error, response: string) => {
      //  if (err || response != 'ok') {
      //    console.log('pause when ballMove 2', err, response);
      //    this.pong.playerRight.state = PlayerState.DISCONNECTED;
      //    this.pong.state = PongState.PAUSE;
      //    console.log(`GAME: state is`, this.pong.state, this.pong.playerLeft.state, this.pong.playerRight.state);
      //  }
      //});
      // TODO: emit ballMove to everyone else in room
      await this.sendBallMove(this.pong.playerLeft.socket.id);
      if (this.pong.state != PongState.PLAY) {
        this.pong.server.to(this.pong.name).emit('pause');
        clearInterval(this.pong.interval);
        return ;
      }
      await this.sendBallMove(this.pong.playerRight.socket.id);
      if (this.pong.state != PongState.PLAY) {
        this.pong.server.to(this.pong.name).emit('pause');
        clearInterval(this.pong.interval);
        return ;
      }

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
