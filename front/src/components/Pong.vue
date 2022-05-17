<template>
  <div class="board">
    <h1>Pong</h1>
    <canvas id="canvas" tabindex="0" width="640" height="480" @click.once="waitingForOpponent" @mousemove="playerMove" @keydown="playerMove">
      {{ unsupportedMsg }}
    </canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'
import io from 'socket.io-client'
import PointI from '../types/interfaces/point.interface'
import PongI from '../types/interfaces/pong.interface'

// TODO: ball

// TODO: fix init ball direction
// TODO: fix paddle collision with canvas border (mouse/keyboard)
// TODO: waitingForOpponent animation
// TODO: pause menu
// TODO: player/game STATE
// TODO: Countdown before game start
// TODO: mirror game ?

const State = {
  PAUSE: 0,
  PLAY: 1,
};


export default defineComponent({
  name: 'Pong',
  data() {
    return {
      socket: io(),
      pong: {} as PongI,
      state: State.PAUSE,
      unsupportedMsg: 'Sorry, your browser does not support canvas.'
    };
  },
  methods: {
    initPong() {
      this.pong.canvas = document.getElementById('canvas') as HTMLCanvasElement;
      this.pong.context = this.pong.canvas.getContext('2d') as CanvasRenderingContext2D;
      this.pong.player_dimensions = {x: 5, y: 100};
      this.pong.player = {
        y: this.pong.canvas.height / 2 - this.pong.player_dimensions.y / 2,
        score: 0
      };
      this.pong.opponent = {
        y: this.pong.canvas.height / 2 - this.pong.player_dimensions.y / 2,
        score: 0
      };
      this.pong.ball = {
        pos: {
          x: this.pong.canvas.width / 2,
          y: this.pong.canvas.width / 2
        },
        radius: 5,
        speed: {x: 2, y: 2},
        max_speed: 25
      },
      this.pong.fps = 30;
    },
    start() {
      this.pong.context.fillStyle = 'black';
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);
      this.pong.context.fillStyle = 'lightgrey';
      this.pong.context.font = '64px Orbitron';
      this.pong.context.textAlign = 'center';
      this.pong.context.fillText('CLICK TO START', this.pong.canvas.width / 2, this.pong.canvas.height / 2);
    },
    waitingForOpponent() {
      this.pong.context.fillStyle = 'black';
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);
      this.pong.context.fillStyle = 'lightgrey';
      this.pong.context.textAlign = 'center';
      this.pong.context.font = '40px Orbitron';
      this.pong.context.fillText('Waiting for opponent...', this.pong.canvas.width / 2, this.pong.canvas.height / 2);
      this.socket.emit('playerReady');
    },
    pause() {
      this.pong.context.fillStyle = 'black';
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);
      this.pong.context.fillStyle = 'lightgrey';
      this.pong.context.textAlign = 'center';
      this.pong.context.font = '40px Orbitron';
      this.pong.context.fillText('Waiting for opponent...', this.pong.canvas.width / 2, this.pong.canvas.height / 2);
    },
    draw() {
      // Draw fields
      this.pong.context.fillStyle = 'black';
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);

      // Draw middle lines
      this.pong.context.strokeStyle = 'lightgrey';
      this.pong.context.beginPath();
      this.pong.context.moveTo(this.pong.canvas.width / 2, 0);
      this.pong.context.lineTo(this.pong.canvas.width / 2, this.pong.canvas.height);
      this.pong.context.stroke();

      // Draw players
      this.pong.context.fillStyle = 'lightgrey';
      this.pong.context.fillRect(0, this.pong.player.y, this.pong.player_dimensions.x, this.pong.player_dimensions.y);
      this.pong.context.fillRect(this.pong.canvas.width - this.pong.player_dimensions.x, this.pong.opponent.y, this.pong.player_dimensions.x, this.pong.player_dimensions.y);

      // Draw ball
      this.pong.context.beginPath();
      this.pong.context.fillStyle = 'lightgrey';
      this.pong.context.arc(this.pong.ball.pos.x, this.pong.ball.pos.y, this.pong.ball.radius, 0, Math.PI * 2, false);
      this.pong.context.fill();

      // Draw scores
      this.pong.context.fillStyle = 'lightgrey';
      this.pong.context.font = '64px Orbitron';
      this.pong.context.textAlign = 'center';
      this.pong.context.fillText(this.pong.player.score.toString(), 100, 100);
      this.pong.context.fillText(this.pong.opponent.score.toString(), this.pong.canvas.width - 100, 100);
    },
    playerMove(e: Event) {
      if (e.type == 'mousemove') {
        let rect = this.pong.canvas.getBoundingClientRect();
        let mouseLocation = ((e as MouseEvent).clientY - rect.top) / (rect.bottom - rect.top) * this.pong.canvas.height;
        if (mouseLocation > this.pong.canvas.height - this.pong.player_dimensions.y / 2) {
            this.pong.player.y = this.pong.canvas.height - this.pong.player_dimensions.y;
        } else {
            this.pong.player.y = mouseLocation - this.pong.player_dimensions.y / 2;
        }
      } else if (e.type == 'keydown') {
      if ((e as KeyboardEvent).key == 'w') {
        if (this.pong.player.y > 0) {
          this.pong.player.y -= 10;
        }
        } else if ((e as KeyboardEvent).key == 's') {
          if (this.pong.player.y < this.pong.canvas.height - this.pong.player_dimensions.y) {
            this.pong.player.y += 10;
          }
        }
      }
      this.socket.emit('playerMove', this.pong.player.y);
    },
    ballMove() {
      // Rebounds on top and bottom
      if (this.pong.ball.pos.y > this.pong.canvas.height || this.pong.ball.pos.y < 0)
        this.pong.ball.speed.y *= -1;

      // Update ball pos
      this.pong.ball.pos.x += this.pong.ball.speed.x;
      this.pong.ball.pos.y += this.pong.ball.speed.y;

      // Check collisions with players
      if (this.pong.ball.pos.x > this.pong.canvas.width - this.pong.player_dimensions.x) {
        this.collide(this.pong.opponent.y);
      } else if (this.pong.ball.pos.x < this.pong.player_dimensions.x) {
        this.collide(this.pong.player.y);
      }
    },
    collide(y: number) {
      // The player does not hit the ball
      if (this.pong.ball.pos.y < y || this.pong.ball.pos.y > y + this.pong.player_dimensions.y) {
        // Increment scores
        if (this.pong.ball.pos.x < this.pong.canvas.width / 2) {
          this.pong.opponent.score += 1;
        } else if (this.pong.ball.pos.x >= this.pong.canvas.width / 2) {
          this.pong.player.score += 1;
        }

        // Reset ball pos
        this.pong.ball.pos.x = this.pong.canvas.width / 2;
        this.pong.ball.pos.y = this.pong.canvas.height / 2;

        // Reset players pos
        this.pong.player.y = this.pong.canvas.height / 2 - this.pong.player_dimensions.y / 2;
        this.pong.opponent.y = this.pong.canvas.height / 2 - this.pong.player_dimensions.y / 2;

        // Reset speed
        this.pong.ball.speed.x = 2;
      } else {
        // Increase speed and change direction
        this.pong.ball.speed.x *= -1.2;
        if (this.pong.ball.speed.x > this.pong.ball.max_speed) {
          this.pong.ball.speed.x = this.pong.ball.max_speed;
        } else if (this.pong.ball.speed.x < -this.pong.ball.max_speed) {
          this.pong.ball.speed.x = -this.pong.ball.max_speed;
        }

        // 
        let impact = this.pong.ball.pos.y - y - this.pong.player_dimensions.y / 2;
        let ratio = 100 / (this.pong.player_dimensions.y / 2);
        this.pong.ball.speed.y = Math.round(impact * ratio / 20);
        if (this.pong.ball.speed.y > this.pong.ball.max_speed) {
          this.pong.ball.speed.y = this.pong.ball.max_speed;
        } else if (this.pong.ball.speed.y < -this.pong.ball.max_speed) {
          this.pong.ball.speed.y = -this.pong.ball.max_speed;
        }
      }
    },
    play() {
      this.draw();
      this.ballMove();
      setTimeout(() => {
        if (this.state == State.PLAY) {
          requestAnimationFrame(this.play);
        }
      }, 1000 / this.pong.fps);
    },
  },
  mounted() {
    if (this.socket.connected == false)
      this.socket = io('http://localhost:3000/play', { withCredentials: true });

    this.socket.on('start', (ballSpeed: PointI) => {
      console.log('game starting ' , ballSpeed);
      this.pong.ball.speed = ballSpeed;
      this.state = State.PLAY;
      this.play();
    });

    this.socket.on('pause', () => {
      this.state = State.PLAY;
      this.pause();
    });

    this.socket.on('opponentMove', (y: number) => {
      //console.log('opponentMoved to ' + y);
      this.pong.opponent.y = y;
    });

    this.initPong();
    this.start();
  }
});
</script>

<style lang="scss" scoped>
#canvas {
  margin-left: 250px;
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
}
</style>

<!--
  //methods: {
  //    move(e: Element) {
  //        if (e.type == 'mousemove') {
  //            let rect = this.canvas.getBoundingClientRect();
  //            let mouseLocation = (e.clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height;
  //            if (mouseLocation > this.canvas.height - this.player_height / 2) {
  //                this.player.pos = this.canvas.height - this.player_height;
  //            } else {
  //                this.player.pos = mouseLocation - this.player_height / 2;
  //            }
  //        }
  //        if (e.type == 'keydown') {
  //            // Player 1
  //            if (e.key == 'w') {
  //                if (this.player.pos > 0) {
  //                    this.player.pos -= 10;
  //                }
  //            } else if (e.key == 's') {
  //                if (this.player.pos < this.canvas.height - this.player_height) {
  //                    this.player.pos += 10;
  //                }
  //            }
  //            // Player 2
  //            if (e.key == 'ArrowUp') {
  //                if (this.opponent.pos > 0) {
  //                    this.opponent.pos -= 10;
  //                }
  //            } else if (e.key == 'ArrowDown') {
  //                if (this.opponent.pos < this.canvas.height - this.player_height) {
  //                    this.opponent.pos += 10;
  //                }
  //            }
  //        }
  //    },
  //},
-->
