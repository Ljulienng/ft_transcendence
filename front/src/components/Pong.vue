<template lang="html">
  <div class="container">
    <!-- <h1>Pong</h1> -->
    <div class="board" ref="board">
      <canvas id="canvas" ref="canvas" tabindex="0" :width="width" :height="height" @click.once="waitingForplayerLeft"
        @mousemove="playerMove" @keydown="playerMove">
        {{ unsupportedMsg }}
      </canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'
import io from 'socket.io-client'
import PointI from '../types/interfaces/point.interface'
import PongI from '../types/interfaces/pong.interface'

// TODO: ball
// TODO: updateBall func to convert datas receive from back

// TODO: fix init ball direction
// TODO: fix paddle collision with canvas border (mouse/keyboard)
// TODO: waiting for opponent animation
// TODO: pause menu
// TODO: player/game STATE
// TODO: Countdown before game start
// TODO: mirror game in option?
// TODO: implement pause menu
// TODO: timeout event for 'oppenent gave up due to misconnexion'

const State = {
  NONE: 0,
  PLAY: 1,
  PAUSE: 2
};

export default defineComponent({
  name: 'Pong',
  data() {
    return {
      socket: io(),
      pong: {} as PongI,
      state: State.NONE,
      unsupportedMsg: 'Sorry, your browser does not support canvas.',
      width: 640,
      height: 480
    };
  },
  methods: {
    initPong() {
      this.pong.canvas = document.getElementById('canvas') as HTMLCanvasElement;
      this.pong.context = this.pong.canvas.getContext('2d') as CanvasRenderingContext2D;
      this.pong.playerSize = { x: this.pong.canvas.width / 128, y: this.pong.canvas.height / 8 };
      this.pong.playerRight = {
        y: this.pong.canvas.height / 2 - this.pong.playerSize.y / 2,
        score: 0
      };
      this.pong.playerLeft = {
        y: this.pong.canvas.height / 2 - this.pong.playerSize.y / 2,
        score: 0
      };
      this.pong.ball = {
        pos: {
          x: this.pong.canvas.width / 2,
          y: this.pong.canvas.width / 2
        },
        radius: 5
        // speed: { x: 2, y: 2 },
        // max_speed: 25
      },
        this.pong.isLeftSide = false;
    },
    start() {
      this.pong.context.fillStyle = 'black';
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);
      this.pong.context.fillStyle = 'lightgrey';
      this.pong.context.font = '64px Orbitron';
      this.pong.context.textAlign = 'center';
      this.pong.context.fillText('CLICK TO START', this.pong.canvas.width / 2, this.pong.canvas.height / 2);
    },
    waitingForplayerLeft() {
      this.pong.context.fillStyle = 'black';
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);
      this.pong.context.fillStyle = 'lightgrey';
      this.pong.context.textAlign = 'center';
      this.pong.context.font = '40px Orbitron';
      this.pong.context.fillText('Waiting for opponent...', this.pong.canvas.width / 2, this.pong.canvas.height / 2);
      this.state = State.PAUSE;

      this.socket.on('pause', () => {
        this.state = State.PAUSE;
        this.pause();
      });

      this.socket.on('start', async (isLeftSide: boolean) => {
        console.log(this.socket.id + ': isLeftSide ? ' + isLeftSide);
        this.pong.isLeftSide = isLeftSide;
        this.state = State.PLAY;

        this.socket.on('opponentMove', async (y: number) => {
          y = y / 100 * this.pong.canvas.height;
          await this.$nextTick();
          if (this.pong.isLeftSide) {
            this.pong.playerRight.y = y;
          } else {
            this.pong.playerLeft.y = y;
          }
        });

        this.socket.on('ballMove', (pos: PointI) => {
          this.pong.ball.pos.x = pos.x / 100 * this.pong.canvas.width;
          this.pong.ball.pos.y = pos.y / 66 * this.pong.canvas.height;
        });

        // TODO: scores event
        await this.$nextTick();
        this.play();
      });
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
      if (this.state == State.NONE) {
        this.start();
        return;
      } else if (this.state == State.PAUSE) {
        this.pause();
        return;
      }
      // Draw fields
      this.pong.context.fillStyle = 'black';
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);

      // Draw middle lines
      this.pong.context.strokeStyle = 'lightgrey';
      this.pong.context.beginPath();
      this.pong.context.moveTo(this.pong.canvas.width / 2, 0);
      this.pong.context.lineTo(this.pong.canvas.width / 2, this.pong.canvas.height);
      this.pong.context.stroke();

      // Draw scores
      //this.pong.context.fillStyle = 'lightgrey';
      //this.pong.context.font = '64px Orbitron';
      //this.pong.context.textAlign = 'center';
      //this.pong.context.fillText(this.pong.playerRight.score.toString(), this.pong.canvas.width, this.pong.canvas.height);
      //this.pong.context.fillText(this.pong.playerLeft.score.toString(), this.pong.canvas.width - 100, 100);

      // Draw playerLeft
      this.pong.context.fillStyle = 'lightgrey';
      this.pong.context.fillRect(0, this.pong.playerLeft.y, this.pong.playerSize.x, this.pong.playerSize.y);
      this.pong.context.fillStyle = 'green';
      this.pong.context.fillRect(0, this.pong.playerLeft.y, this.pong.playerSize.x, 5);
      // Draw playerRight
      this.pong.context.fillStyle = 'lightgrey';
      this.pong.context.fillRect(this.pong.canvas.width - this.pong.playerSize.x, this.pong.playerRight.y, this.pong.playerSize.x, this.pong.playerSize.y);
      this.pong.context.fillStyle = 'green';
      this.pong.context.fillRect(this.pong.canvas.width - this.pong.playerSize.x, this.pong.playerRight.y, this.pong.playerSize.x, 5);

      // Draw ball
      this.pong.context.beginPath();
      this.pong.context.fillStyle = 'lightgrey';
      this.pong.context.arc(this.pong.ball.pos.x, this.pong.ball.pos.y, this.pong.ball.radius, 0, Math.PI * 2, false);
      this.pong.context.fill();
    },
    playerMove(e: Event) {
      if (this.state != State.PLAY)
        return;
      const playerToMove = this.pong.isLeftSide ? this.pong.playerLeft : this.pong.playerRight;
      if (e.type == 'mousemove') {
        let rect = this.pong.canvas.getBoundingClientRect();
        let mouseLocation = ((e as MouseEvent).clientY - rect.top) / (rect.bottom - rect.top) * this.pong.canvas.height;
        if (mouseLocation > this.pong.canvas.height - this.pong.playerSize.y / 2) {
          playerToMove.y = this.pong.canvas.height - this.pong.playerSize.y;
        } else {
          playerToMove.y = mouseLocation - this.pong.playerSize.y / 2;
        }
      } else if (e.type == 'keydown') {
        if ((e as KeyboardEvent).key == 'w') {
          if (playerToMove.y > 0) {
            playerToMove.y -= 10;
          }
        } else if ((e as KeyboardEvent).key == 's') {
          if (playerToMove.y < this.pong.canvas.height - this.pong.playerSize.y) {
            playerToMove.y += 10;
          }
        }
      }
      this.draw();
      this.socket.emit('playerMove', { x: playerToMove.y, y: this.pong.canvas.height });
    },
    /*
    ballMove() {
      // Rebounds on top and bottom
      if (this.pong.ball.pos.y > this.pong.canvas.height || this.pong.ball.pos.y < 0)
        this.pong.ball.speed.y *= -1;
      // Update ball pos
      this.pong.ball.pos.x += this.pong.ball.speed.x;
      this.pong.ball.pos.y += this.pong.ball.speed.y;
      // Check collisions with players
      if (this.pong.ball.pos.x > this.pong.canvas.width - this.pong.playerSize.x) {
        this.collide(this.pong.playerLeft.y);
      } else if (this.pong.ball.pos.x < this.pong.playerSize.x) {
        this.collide(this.pong.playerRight.y);
      }
      this.draw();
    },
    collide(y: number) {
      // The playerRight does not hit the ball
      if (this.pong.ball.pos.y < y || this.pong.ball.pos.y > y + this.pong.playerSize.y) {
        // Increment scores
        if (this.pong.ball.pos.x < this.pong.canvas.width / 2) {
          this.pong.playerLeft.score += 1;
        } else if (this.pong.ball.pos.x >= this.pong.canvas.width / 2) {
          this.pong.playerRight.score += 1;
        }

        // Reset ball pos
        this.pong.ball.pos.x = this.pong.canvas.width / 2;
        this.pong.ball.pos.y = this.pong.canvas.height / 2;

        // Reset players pos
        this.pong.playerRight.y = this.pong.canvas.height / 2 - this.pong.playerSize.y / 2;
        this.pong.playerLeft.y = this.pong.canvas.height / 2 - this.pong.playerSize.y / 2;

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
        let impact = this.pong.ball.pos.y - y - this.pong.playerSize.y / 2;
        let ratio = 100 / (this.pong.playerSize.y / 2);
        this.pong.ball.speed.y = Math.round(impact * ratio / 20);
        if (this.pong.ball.speed.y > this.pong.ball.max_speed) {
          this.pong.ball.speed.y = this.pong.ball.max_speed;
        } else if (this.pong.ball.speed.y < -this.pong.ball.max_speed) {
          this.pong.ball.speed.y = -this.pong.ball.max_speed;
        }
      }
    },
    */
    play() {
      this.draw();
      requestAnimationFrame(this.play);
    },
    async resizeCanvas() {
      await this.$nextTick();
      if ((this.$refs.board as HTMLDivElement).offsetWidth * 0.66 <= (this.$refs.board as HTMLDivElement).offsetHeight) {
        this.width = (this.$refs.board as HTMLDivElement).offsetWidth * 0.98;
        this.height = (this.$refs.board as HTMLDivElement).offsetWidth * 0.66 * 0.98;
      } else if ((this.$refs.board as HTMLDivElement).offsetHeight * 1.33 <= (this.$refs.board as HTMLDivElement).offsetWidth) {
        this.height = (this.$refs.board as HTMLDivElement).offsetHeight * 0.98;
        this.width = (this.$refs.board as HTMLDivElement).offsetHeight * 1.33 * 0.98;
      }
      await this.$nextTick();
      this.pong.playerSize.x = this.pong.canvas.width / 100;
      this.pong.playerSize.y = this.pong.canvas.height / 3.3;
      this.pong.ball.radius = this.pong.canvas.width / 100;
      await this.$nextTick();
      this.draw();
    }
  },
  async mounted() {
    this.initPong();
    if (this.socket.connected == false) {
      this.socket = io('localhost:3000/play', { withCredentials: true });
    }
    window.addEventListener("resize", this.resizeCanvas);
    await this.resizeCanvas();
    this.start();
  }
});
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
}

.board {
  width: 100%;
  height: 100vh;
}

#canvas {
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  border: 1px solid rgb(255, 246, 107);
}
</style>
