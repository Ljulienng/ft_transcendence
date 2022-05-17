import { Server } from 'socket.io';

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
  id: string;
  y: number;
  score: number;
  state: PlayerState;
}

export interface Ball {
  pos: Point;
}

export interface Pong {
  server: Server
  player1: Player;
  player2: Player;
  ball: Ball;
  state: PongState;
}

