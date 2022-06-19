import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { User } from 'src/user/models/user.entity';
import { Options } from './interfaces/options.interface';
import { Point } from './interfaces/point.interface';

// TODO: emit event individually to handle spectator mode

@Injectable()
export class Event {

  constructor(private server: Server) { }

  emitStart(options: Options, id: string, opponent: User, isLeftPlayer: boolean) {
    this.server.to(id).volatile.emit('start', options, opponent, isLeftPlayer);
  }

  emitOpponentMove(id: string, y: number) {
    this.server.to(id).volatile.emit('opponentMove', y);
  }

  emitBallMove(id: string, pos: Point) {
    this.server.volatile.to(id).volatile.emit('ballMove', pos);
  }

  emitUpdateScore(id: string, score: Point) {
    this.server.to(id).volatile.emit('updateScore', score);
  }

  emitPause(id: string) {
    this.server.to(id).volatile.emit('pause');
  }

  emitYouWin(id: string) {
    this.server.to(id).volatile.emit('youWin');
  }

  emitYouLose(id: string) {
    this.server.to(id).volatile.emit('youLose');
  }
}
