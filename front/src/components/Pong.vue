<template lang="html">
  <div class="container">
    <!-- <h1>Pong</h1> -->
    <div class="board" ref="board">
      <canvas id="canvas" ref="canvas" tabindex="0" :width="width" :height="height" @click.once="onReady"
        @mousemove="onMove" @keydown="onMove">
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

// TODO: fix paddle collision with canvas border (mouse/keyboard)
// TODO: waiting for opponent animation
// TODO: Countdown before game start
// TODO: menu for 'win by forfait'
// TODO: event beforeUnload should emit disconnect

const State = {
  INIT: 0,
  PAUSE: 1,
  PLAY: 2,
  WIN: 3,
  LOSE: 4
};

export default defineComponent({
  name: 'Pong',
  data() {
    return {
      socket: io(),
      pong: {} as PongI,
      state: State.INIT,
      unsupportedMsg: 'Sorry, your browser does not support canvas.',
      width: 640,
      height: 480
    };
  },
  methods: {
    async init() {
      this.pong.canvas = document.getElementById('canvas') as HTMLCanvasElement;
      this.pong.context = this.pong.canvas.getContext('2d') as CanvasRenderingContext2D;
      this.pong.playerSize = {
        x: this.pong.canvas.width / 128,
        y: this.pong.canvas.height / 8
      };
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
      };
      this.pong.isLeftSide = false;
      this.state = State.INIT;
      window.addEventListener("resize", this.onResize);
      await this.onResize();
    },
    startPage() {
      this.pong.context.fillStyle = 'black';
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);
      this.pong.context.fillStyle = 'lightgrey';
      this.pong.context.font = '64px Orbitron';
      this.pong.context.textAlign = 'center';
      this.pong.context.fillText('CLICK TO START', this.pong.canvas.width / 2, this.pong.canvas.height / 2, this.pong.canvas.width);
    },
    losePage() {
      this.state = State.LOSE;
      this.pong.context.fillStyle = 'black';
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);
      this.pong.context.fillStyle = 'red';
      this.pong.context.font = '64px Orbitron';
      this.pong.context.textAlign = 'center';
      this.pong.context.fillText('YOU LOSE', this.pong.canvas.width / 2, this.pong.canvas.height / 2, this.pong.canvas.width);
    },
    winPage() {
      this.state = State.WIN;
      this.pong.context.fillStyle = 'black';
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);
      this.pong.context.fillStyle = 'green';
      this.pong.context.font = '64px Orbitron';
      this.pong.context.textAlign = 'center';
      this.pong.context.fillText('YOU WIN', this.pong.canvas.width / 2, this.pong.canvas.height / 2, this.pong.canvas.width);
    },
    pausePage() {
      this.state = State.PAUSE;
      this.pong.context.fillStyle = 'black';
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);
      this.pong.context.fillStyle = 'lightgrey';
      this.pong.context.textAlign = 'center';
      this.pong.context.font = '40px Orbitron';
      this.pong.context.fillText('Waiting for opponent...', this.pong.canvas.width / 2, this.pong.canvas.height / 2, this.pong.canvas.width);
    },
    draw() {
      switch (this.state) {
        case State.INIT:
          return this.startPage();
        case State.PAUSE:
          return this.pausePage();
        case State.WIN:
          return this.winPage();
        case State.LOSE:
          return this.losePage();
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
      this.pong.context.fillStyle = 'lightgrey';
      this.pong.context.font = '32px Orbitron';
      this.pong.context.textAlign = 'center';
      this.pong.context.fillText(this.pong.playerLeft.score.toString(), this.pong.canvas.width / 4, 32, this.pong.canvas.width);
      this.pong.context.fillText(this.pong.playerRight.score.toString(), (this.pong.canvas.width / 4) * 3, 32, this.pong.canvas.width);

      // Draw playerLeft
      this.pong.context.fillStyle = 'lightgrey';
      this.pong.context.fillRect(0, this.pong.playerLeft.y, this.pong.playerSize.x, this.pong.playerSize.y);
      // Draw playerRight
      this.pong.context.fillStyle = 'lightgrey';
      this.pong.context.fillRect(this.pong.canvas.width - this.pong.playerSize.x, this.pong.playerRight.y, this.pong.playerSize.x, this.pong.playerSize.y);

      // Draw ball
      this.pong.context.beginPath();
      this.pong.context.fillStyle = 'lightgrey';
      this.pong.context.arc(this.pong.ball.pos.x, this.pong.ball.pos.y, this.pong.ball.radius, 0, Math.PI * 2, false);
      this.pong.context.fill();
    },
    onMove(e: Event) {
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
      if (playerToMove.y < 0) {
        playerToMove.y = 0;
      }
       if (playerToMove.y > this.pong.canvas.height - this.pong.playerSize.y) {
        playerToMove.y = this.pong.canvas.height - this.pong.playerSize.y;
      }
      this.draw();
      this.socket.emit('playerMove', { x: playerToMove.y, y: this.pong.canvas.height });
    },
    onReady() {
      this.pausePage();
      if (this.socket.connected == false) {
        this.socket = io('localhost:3000/play', { withCredentials: true });
      }

      this.socket.on('pause', () => { this.pausePage(); });
      this.socket.on('youWin', () => { this.winPage(); });
      this.socket.on('youLose', () => { this.losePage(); });

      this.socket.on('start', async (isLeftSide: boolean, callback) => {
        callback('ok');
        this.state = State.PLAY;
        this.pong.playerLeft.y = this.pong.canvas.height / 2 - this.pong.playerSize.y / 2;
        this.pong.playerRight.y = this.pong.canvas.height / 2 - this.pong.playerSize.y / 2;
        this.pong.isLeftSide = isLeftSide;
        this.socket.on('opponentMove', async (y: number, callback) => {
          callback('ok');
          y = y / 66 * this.pong.canvas.height;
          await this.$nextTick();
          if (this.pong.isLeftSide) {
            this.pong.playerRight.y = y;
          } else {
            this.pong.playerLeft.y = y;
          }
        });
        this.socket.on('ballMove', (pos: PointI, callback) => {
          callback('ok');
          this.pong.ball.pos.x = pos.x / 100 * this.pong.canvas.width;
          this.pong.ball.pos.y = pos.y / 66 * this.pong.canvas.height;
        });
        this.socket.on('updateScore', (score: PointI, callback) => {
          callback('ok');
          this.pong.playerLeft.score = score.x;
          this.pong.playerRight.score = score.y;
        });
        await this.$nextTick();
        this.play();
      });

      // TODO: countdown before game start
    },
    play() {
      this.draw();
      requestAnimationFrame(this.play);
    },
    async onResize() {
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
    await this.init();
    this.startPage();
  },
  beforeUnmount() {
      this.socket.emit('playerLeave');
    },
 
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
