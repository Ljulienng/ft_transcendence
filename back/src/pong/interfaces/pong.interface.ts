import { Server } from 'socket.io';
import { SocketUserI } from 'src/chat/chat.gateway';

export enum PlayerState {
  DISCONNECTED,
  CONNECTED
}

export enum PongState {
  OFF,
  ON
}

export interface Point {
  x: number;
  y: number;
}

export interface Player {
  socket: SocketUserI;
  y: number;
  score: number;
  state: PlayerState;
}

export interface Ball {
  pos: Point;
  radius: number;
  speed: Point;
  maxSpeed: number;
}

export interface Pong {
  server: Server;
  state: PongState;
  fps: number;
  playerSize: Point;
  playerLeft: Player;
  playerRight: Player;
  ball: Ball;
  boardSize: Point;
}
