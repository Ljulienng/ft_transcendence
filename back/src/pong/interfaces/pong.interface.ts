import { Socket, Server } from 'socket.io';
import { User } from 'src/user/models/user.entity';

// export enum PlayerState {
//   DISCONNECTED,
//   CONNECTED
// }

// export enum PongState {
//   OFF,
//   ON
// }

export interface SocketPlayer {
  socket: Socket;
  user: User;
}

export interface Point {
  x: number;
  y: number;
}

export interface Player {
  socket: Socket;
  user: User;
  y: number;
  score: number;
  // state: PlayerState;
}

export interface Ball {
  pos: Point;
  radius: number;
  speed: Point;
  maxSpeed: number;
}

export interface Pong {
  server: Server;
  // state: PongState;
  interval: NodeJS.Timer;
  fps: number;
  playerSize: Point;
  boardSize: Point;
  winScore: number;
  playerLeft: Player;
  playerRight: Player;
  ball: Ball;
}
