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
    this.server.to(id).emit('start', options, opponent, isLeftPlayer);
  }

  emitStartSpec(options: Options, id: string, playerLeft: string, playerRight: string) {
    this.server.to(id).emit('startSpec', options, playerLeft, playerRight);
  }

  emitOpponentMove(id: string, y: number) {
    this.server.to(id).emit('opponentMove', y);
  }

  emitPlayerMove(id: string, isLeftSide: boolean, y: number) {
    this.server.to(id).emit('playerMove', isLeftSide, y);
  }

  emitBallMove(id: string, pos: Point) {
    this.server.to(id).emit('ballMove', pos);
  }

  emitUpdateScore(id: string, score: Point) {
    this.server.to(id).emit('updateScore', score);
  }

  emitPause(id: string) {
    this.server.to(id).emit('pause');
  }

  emitYouWin(id: string) {
    this.server.to(id).emit('youWin');
  }

  emitGameOver(id: string, winner: string) {
    this.server.to(id).emit('gameOver', winner);
  }

  emitYouLose(id: string) {
    this.server.to(id).emit('youLose');
  }
}
