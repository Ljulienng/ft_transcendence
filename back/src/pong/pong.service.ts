import { Injectable } from '@nestjs/common';
import { PlayerState, Point, Pong, PongState } from './interfaces/pong.interface';
import { Server } from 'socket.io';

@Injectable()
export class PongService {
  public pong: Pong;

  constructor() {
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
        y: 50,
        score: 0,
        state: PlayerState.DISCONNECTED,
        canvas: undefined
      },
      playerRight: {
        id: null,
        y: 50,
        score: 0,
        state: PlayerState.DISCONNECTED,
        canvas: undefined
      },
      ball: {
        pos: {
          x: 50,
          y: 33
        },
        radius: 2,
        speed: {
          x: 2,
          y: 2
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
      console.error('To many player for this game.');
    }
    console.log(`player ${playerID} joined the game.`);
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

  playerReady(playerID: string) {
    console.log('new player ready !');
    if (this.pong.playerLeft.id == playerID) {
      this.pong.playerLeft.state = PlayerState.CONNECTED;
      console.log(`Player 1: ${playerID} READY !`);
    } else if (this.pong.playerRight.id == playerID) {
      this.pong.playerRight.state = PlayerState.CONNECTED;
      console.log(`Player 2: ${playerID} READY !`);
    }
    if (this.pong.playerLeft.state == PlayerState.CONNECTED && this.pong.playerRight.state == PlayerState.CONNECTED) {
      this.pong.server.to(this.pong.playerLeft.id).emit('start', true);
      this.pong.server.to(this.pong.playerRight.id).emit('start', false);
      // this.start(); // TODO:
    }
  }

  movePlayer(playerID: string, y: number, canvasHeight: number) {
    y = y / canvasHeight * 100;
    if (this.pong.playerLeft.id == playerID) {
      this.pong.playerLeft.y = y;
      this.pong.server.to(this.pong.playerRight.id).volatile.emit('opponentMove', y);
    } else if (this.pong.playerRight.id == playerID) {
      this.pong.playerRight.y = y;
      this.pong.server.to(this.pong.playerLeft.id).volatile.emit('opponentMove', y);
    }
  }

/*
  ballMove() {
    // Rebounds on top and bottom
    if (this.pong.ball.pos.y > this.pong.boardSize.y || this.pong.ball.pos.y < 0)
      this.pong.ball.speed.y *= -1;
    // Update ball pos
    this.pong.ball.pos.x += this.pong.ball.speed.x;
    this.pong.ball.pos.y += this.pong.ball.speed.y;
    // Check collisions with players
    //if (this.pong.ball.pos.x > this.pong.boardSize.x - this.pong.playerSize.x) {
    //  this.collide(this.pong.playerLeft.y);
    //} else if (this.pong.ball.pos.x < this.pong.playerSize.x) {
    //  this.collide(this.pong.playerRight.y);
    //}
    this.pong.server.volatile.emit('ballMove', this.pong.ball.pos, this.pong.ball.radius);
  }
  collide(y: number) {
    // The playerRight does not hit the ball
    if (this.pong.ball.pos.y < y || this.pong.ball.pos.y > y + this.pong.playerSize.y) {
      // Increment scores
      if (this.pong.ball.pos.x < this.pong.boardSize.x / 2) {
        this.pong.playerLeft.score += 1;
      } else if (this.pong.ball.pos.x >= this.pong.boardSize.x / 2) {
        this.pong.playerRight.score += 1;
      }

      // Reset ball pos
      this.pong.ball.pos.x = this.pong.boardSize.x / 2;
      this.pong.ball.pos.y = this.pong.boardSize.y / 2;

      // Reset players pos
      this.pong.playerRight.y = this.pong.boardSize.y / 2 - this.pong.playerSize.y / 2;
      this.pong.playerLeft.y = this.pong.boardSize.y / 2 - this.pong.playerSize.y / 2;

      // Reset speed
      this.pong.ball.speed.x = 2;
    } else {
      // Increase speed and change direction
      this.pong.ball.speed.x *= -1.2;
      if (this.pong.ball.speed.x > this.pong.ball.maxSpeed) {
        this.pong.ball.speed.x = this.pong.ball.maxSpeed;
      } else if (this.pong.ball.speed.x < -this.pong.ball.maxSpeed) {
        this.pong.ball.speed.x = -this.pong.ball.maxSpeed;
      }

      // 
      let impact = this.pong.ball.pos.y - y - this.pong.playerSize.y / 2;
      let ratio = 100 / (this.pong.playerSize.y / 2);
      this.pong.ball.speed.y = Math.round(impact * ratio / 20);
      if (this.pong.ball.speed.y > this.pong.ball.maxSpeed) {
        this.pong.ball.speed.y = this.pong.ball.maxSpeed;
      } else if (this.pong.ball.speed.y < -this.pong.ball.maxSpeed) {
        this.pong.ball.speed.y = -this.pong.ball.maxSpeed;
      }
    }
  }
  */

  start() {
    while (true) {
      setTimeout(() => {
        //this.ballMove();
        //this.pong.server.volatile.emit('ballMove', this.pong.ball.pos);
      }, 1000 / this.pong.fps);
    }
  }
}

