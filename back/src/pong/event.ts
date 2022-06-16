import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { User } from 'src/user/models/user.entity';
import { Options } from './interfaces/options.interface';
import { Point } from './interfaces/point.interface';

// TODO: emit event individually to handle spectator mode

@Injectable()
export class Event {

  constructor(
    private server: Server
  ) {
  }

  emitStart(options: Options, id: string, opponent: User, isLeftPlayer: boolean): Promise<string> {
    return new Promise(resolve => this.server.timeout(1000).to(id).emit('start', options, opponent, isLeftPlayer, (err: Error, response: string) => {
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
    return new Promise(resolve => this.server.volatile.timeout(1000).to(id).emit('ballMove', pos, (err: Error, response: string) => {
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
    console.log('emit pause');
    this.server.to(id).emit('pause');
  }

  emitYouWin(id: string) {
    this.server.to(id).emit('youWin');
  }

  emitYouLose(id: string) {
    this.server.to(id).emit('youLose');
  }
}
