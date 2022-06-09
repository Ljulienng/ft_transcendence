import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { Point } from './interfaces/point.interface';

// TODO: emit event individually to handle spectator mode

@Injectable()
export class Event {

  private server: Server;

  constructor(server: Server) {
    this.server = server;
  }

  emitStart(id: string, isLeftPlayer: boolean): Promise<string> {
    return new Promise(resolve => this.server.timeout(1000).to(id).emit('start', isLeftPlayer, (err: Error, response: string) => {
      if (err || response != 'ok') {
        response = 'ko';
      }
      resolve(response);
    }));
  }

  emitOpponentMove(id: string, y: number) {
    return new Promise(resolve => this.server.timeout(1000).to(id).emit('opponentMove', y, (err: Error, response: string) => {
      if (err || response != 'ok') {
        response = 'ko';
      }
      resolve(response);
    }));
  }

  emitBallMove(id: string, pos: Point): Promise<string> {
    return new Promise(resolve => this.server.timeout(1000).to(id).emit('ballMove', pos, (err: Error, response: string) => {
      if (err || response != 'ok') {
        response = 'ko';
      }
      resolve(response);
    }));
  }

  emitUpdateScore(id: string, score: Point) {
    return new Promise(resolve => this.server.timeout(1000).to(id).emit('updateScore', score, (err: Error, response: string) => {
      if (err || response != 'ok') {
        response = 'ko';
      }
      resolve(response);
    }));
  }

  emitPause(id: string) {
    this.server.to(id).emit('pause');
  }

  emitYouWin(id: string) {
    this.server.to(id).emit('youWin');
  }

  emitYouLost(id: string) {
    this.server.to(id).emit('youLost');
  }
}
