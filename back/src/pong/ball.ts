import { Injectable } from '@nestjs/common';
import { Game, GameState, HEIGHT, WIDTH } from './game';
import { Point } from './interfaces/point.interface';
import { Event } from './event';
import { Player } from './player';

@Injectable()
export class Ball {

  public pos: Point;
  private speed: Point;
  private maxSpeed: number;
  private radius: number; // TODO: add radius to check collisions

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
    // TODO: this breaks ball speed
    // this.speed.x = ((Math.random() * (100 - 45) + 45) / 100) * (Math.round(Math.random()) ? 1 : -1);
    // this.speed.y = ((Math.random() * (100 - 45) + 45) / 100) * (Math.round(Math.random()) ? 1 : -1);
  }

  async move(playerLeft: Player, playerRight: Player, spectatorRoom: string) { // TODO: review
    // Rebounds on top and bottom
    if (this.pos.y > HEIGHT - this.radius || this.pos.y < this.radius) {
      this.speed.y *= -1;
    }
    // Update ball pos
    this.pos.x += this.speed.x;
    this.pos.y += this.speed.y;

    // Send move event
    this.event.emitBallMove(playerLeft.socket.id, this.pos);  // TODO: emit to players room ?
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
      // Reset players pos
      //this.pong.playerRight.y = this.pong.boardSize.y / 2 - this.pong.playerSize.y / 2;
      //this.pong.playerLeft.y = this.pong.boardSize.y / 2 - this.pong.playerSize.y / 2;
    } else {  // player hit the ball
      this.speed.x *= -1.1; // TODO: increment ball speed
      this.poundSpeed();

      // TODO: review
      // Add a ratio to increment ball speed depending on the paddle impact position
      //let y = playerLeft.y;
      //if (this.pos.x > WIDTH / 2) {
      //  y = playerRight.y;
      //}
      //const distanceFromPaddleMiddle = this.pos.y - y - Player.size.y / 2;
      //const ratio = 100 / (Player.size.y / 2);
      //this.speed.y = Math.round(distanceFromPaddleMiddle * ratio / 50);
      //this.poundSpeed();
    }
  }
}
