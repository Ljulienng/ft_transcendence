import { Injectable } from '@nestjs/common';
import { Game, HEIGHT, WIDTH } from './game';
import { Point } from './interfaces/point.interface';
import { Event } from './event';
import { Player } from './player';

@Injectable()
export class Ball {

  public pos: Point;
  private speed: Point;
  private maxSpeed: number;
  private radius: number;

  constructor(
    private event: Event
  ) {
    this.radius = 0.5;
    this.maxSpeed = 25;
    this.resetPos();
  }

  resetSpeed() {
    this.speed = { x: 0.5, y: 0.5 };
  }

  resetPos() {
    this.pos = { x: WIDTH / 2, y: HEIGHT / 2 };
    this.resetSpeed();
  }

  poundSpeed() {
    if (this.speed.x > this.maxSpeed) {
      this.speed.x = this.maxSpeed;
    } else if (this.speed.x < -this.maxSpeed) {
      this.speed.x = -this.maxSpeed;
    }
  }

  randomDirection() {
    this.speed.x *= (Math.round(Math.random()) ? 1 : -1);
    this.speed.y *= (Math.round(Math.random()) ? 1 : -1);
  }

  async move(playerLeft: Player, playerRight: Player, spectatorRoom: string) {
    // Rebounds on top and bottom
    if (this.pos.y > HEIGHT - this.radius || this.pos.y < this.radius) {
      this.speed.y *= -1;
    }
    // Update ball pos
    this.pos.x += this.speed.x;
    this.pos.y += this.speed.y;

    // Send move event
    this.event.emitBallMove(playerLeft.socket.id, this.pos);
    this.event.emitBallMove(playerRight.socket.id, this.pos);
    this.event.emitBallMove(spectatorRoom, this.pos);
  }

  checkCollisions(game: Game, playerLeft: Player, playerRight: Player) {
    let player: Player;
    let opponent: Player;

    if (this.pos.x < Player.size.x + this.radius) {
      player = playerLeft;
      opponent = playerRight;
    } else if (this.pos.x > WIDTH - Player.size.x - this.radius) {
      player = playerRight;
      opponent = playerLeft;
    } else {
      return;
    }

    if (this.pos.y < player.y || this.pos.y > player.y + Player.size.y) {
      opponent.goal(game);
      this.resetPos();
      this.randomDirection();
    } else {  // player hit the ball
      this.speed.x *= -1.2;
      this.poundSpeed();
    }
  }
}
