import { Injectable } from '@nestjs/common';
import { PlayerState, Point, Pong, PongState } from './interfaces/pong.interface';
import { Server } from 'socket.io';

@Injectable()
export class PongService {
  public pong: Pong;

  constructor() {
    this.resetPong();
  }

  resetPong() {
    this.pong = {
      server: undefined,
      player1: {
        id: null,
        y: 0,
        score: 0,
        state: PlayerState.DISCONNECTED
      },
      player2: {
        id: null,
        y: 0,
        score: 0,
        state: PlayerState.DISCONNECTED
      },
      ball: {
        pos: {
          x: 50,
          y: 50
        }
      },
      state: PongState.OFF
    };
  }

  initServer(server: Server) {
    this.pong.server = server;
    this.pong.state = PongState.ON;
  }

  registerPlayer(playerID: string) {
    if (this.pong.player1.id == null) {
      this.pong.player1.id = playerID;
    } else if (this.pong.player2.id == null) {
      this.pong.player2.id = playerID;
    } else {
      console.error('To many player for this game.');
    }
    console.log(`player ${playerID} joined the game.`);
  }

  playerReady(playerID: string) {
    if (this.pong.player1.id == playerID) {
      this.pong.player1.state = PlayerState.CONNECTED;
      console.log(`Player 1: ${playerID} READY !`);
    } else if (this.pong.player2.id == playerID) {
      this.pong.player2.state = PlayerState.CONNECTED;
      console.log(`Player 2: ${playerID} READY !`);
    }
    if (this.pong.player1.state == PlayerState.CONNECTED && this.pong.player2.state == PlayerState.CONNECTED) {
      this.start();
    }
  }

  // TODO: send ball direction
  start() {
    let signX = (Math.random() > 0.5) ? -1 : 1;
    let signY = (Math.random() > 0.5) ? -1 : 1;
    let ballSpeed: Point = { x: signX * 2, y: signY * 2 };
    this.pong.server.emit('start', ballSpeed);
  }

  disconnectPlayer(playerID: string) {
    console.log(`player ${playerID} left the game.`);
    if (this.pong.player1.id == playerID) {
      this.pong.player1.id = null;
      this.pong.player1.state = PlayerState.DISCONNECTED;
    } else if (this.pong.player2.id == playerID) {
      this.pong.player2.id = null;
      this.pong.player2.state = PlayerState.DISCONNECTED;
    }
    this.pong.server.emit('pause');
    // TODO: implement pause menu
    // TODO: timeout event for 'oppenent gave up due to misconnexion'
  }

  movePlayer(playerID: string, y: number) {
    if (this.pong.player1.id == playerID) {
      this.pong.server.to(this.pong.player2.id).volatile.emit('opponentMove', y);
    } else if (this.pong.player2.id == playerID) {
      this.pong.server.to(this.pong.player1.id).volatile.emit('opponentMove', y);
    }
    //console.log(`player ${playerID} moved to ${y}.`);
  }

}

