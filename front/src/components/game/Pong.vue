<template lang="html">
  <div class="container">
    <div class="board" ref="board">
      <div class="d-flex ustify-content-between" :width="width">
        <div class="col" v-if="state > State.INIT && imageUser && isLeftSide">
          <img :src="this.imageUser" class="profile_avatar_public mx-auto d-block mb-1" />
        </div>
        <div class="col" v-if="state > State.INIT && imageOpponent">
          <img :src="this.imageOpponent" class="profile_avatar_public mx-auto d-block mb-1" />
        </div>
        <div class="col" v-if="state > State.INIT && imageUser && !isLeftSide">
          <img :src="this.imageUser" class="profile_avatar_public mx-auto d-block mb-1" />
        </div>
      </div>
      <canvas id="canvas" ref="canvas" tabindex="0" :width="width" :height="height" @click.once="onReady"
        @mousemove="onMove" @keydown="onMove">
        {{ unsupportedMsg }}
      </canvas>
    </div>
  </div>
</template>

<script lang="ts">
import GameOptionI from '@/types/interfaces/gameoption.interface';
import { UserProfile } from '@/views/Home.vue';
import { defineComponent } from '@vue/runtime-core'
// import io from 'socket.io-client'
import store from '../../store'
import PointI from '../../types/interfaces/point.interface'
import PongI from '../../types/interfaces/pong.interface'
import http from "../../http-common";

// TODO: waiting for opponent animation
// TODO: Countdown before game start
// TODO: menu for 'win by forfait'

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
      State: {
        INIT: 0,
        PAUSE: 1,
        PLAY: 2,
        WIN: 3,
        LOSE: 4
      },
      socket: store.getters['auth/getUserSocket'],
      user: store.getters['auth/getUserProfile'],
      imageUser: null as any,
      opponent: {} as UserProfile,
      imageOpponent: null as any,
      pong: {} as PongI,
      options: {} as GameOptionI,
      state: State.INIT,
      unsupportedMsg: 'Sorry, your browser does not support canvas.',
      width: 640,
      height: 480,
      isPlayer: false,

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
      this.options = {
        bgColor: '#1c1d21', // DARK
        fgColor: '#fff774', // YELLOW
        winScore: 5
      };
      window.addEventListener("resize", this.onResize);
      await this.onResize();
    },
    startPage() {
      this.pong.context.fillStyle = this.options.bgColor;
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);
      this.pong.context.fillStyle = this.options.fgColor;
      this.pong.context.font = '64px Orbitron';
      this.pong.context.textAlign = 'center';
      this.pong.context.fillText('CLICK TO START', this.pong.canvas.width / 2, this.pong.canvas.height / 2, this.pong.canvas.width);
    },
    losePage() {
      this.state = State.LOSE;
      this.pong.context.fillStyle = this.options.bgColor;
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);
      this.pong.context.fillStyle = 'red';
      this.pong.context.font = '64px Orbitron';
      this.pong.context.textAlign = 'center';
      this.pong.context.fillText('YOU LOSE', this.pong.canvas.width / 2, this.pong.canvas.height / 2, this.pong.canvas.width);
    },
    winPage() {
      this.state = State.WIN;
      this.pong.context.fillStyle = this.options.bgColor;
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);
      this.pong.context.fillStyle = 'green';
      this.pong.context.font = '64px Orbitron';
      this.pong.context.textAlign = 'center';
      this.pong.context.fillText('YOU WIN', this.pong.canvas.width / 2, this.pong.canvas.height / 2, this.pong.canvas.width);
    },
    pausePage() {
      this.state = State.PAUSE;
      this.pong.context.fillStyle = this.options.bgColor;
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);
      this.pong.context.fillStyle = this.options.fgColor;
      this.pong.context.textAlign = 'center';
      this.pong.context.font = '40px Orbitron';
      this.pong.context.fillText('Waiting for opponent...', this.pong.canvas.width / 2, this.pong.canvas.height / 2, this.pong.canvas.width);
    },
    draw(): void {
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
      this.pong.context.fillStyle = this.options.bgColor;
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);

      // Draw middle lines
      this.pong.context.strokeStyle = this.options.fgColor;
      this.pong.context.beginPath();
      this.pong.context.moveTo(this.pong.canvas.width / 2, 0);
      this.pong.context.lineTo(this.pong.canvas.width / 2, this.pong.canvas.height);
      this.pong.context.stroke();

      // Draw scores
      this.pong.context.fillStyle = this.options.fgColor;
      this.pong.context.font = '32px Orbitron';
      this.pong.context.textAlign = 'center';
      this.pong.context.fillText(this.pong.isLeftSide ? this.user.userName : this.opponent.username + ' ' + this.pong.playerLeft.score.toString(), this.pong.canvas.width / 4, 32, this.pong.canvas.width);
      this.pong.context.fillText(this.pong.isLeftSide ? this.opponent.username : this.user.userName + ' ' + this.pong.playerRight.score.toString(), (this.pong.canvas.width / 4) * 3, 32, this.pong.canvas.width);

      // Draw playerLeft
      this.pong.context.fillStyle = this.options.fgColor;
      this.pong.context.fillRect(0, this.pong.playerLeft.y, this.pong.playerSize.x, this.pong.playerSize.y);

      // Draw playerRight
      this.pong.context.fillStyle = this.options.fgColor;
      this.pong.context.fillRect(this.pong.canvas.width - this.pong.playerSize.x, this.pong.playerRight.y, this.pong.playerSize.x, this.pong.playerSize.y);

      // Draw ball
      this.pong.context.beginPath();
      this.pong.context.fillStyle = this.options.fgColor;
      this.pong.context.arc(this.pong.ball.pos.x, this.pong.ball.pos.y, this.pong.ball.radius, 0, Math.PI * 2, false);
      this.pong.context.fill();
    },
    onMove(e: Event) {
      if (this.state != State.PLAY || !this.isPlayer)
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
        if ((e as KeyboardEvent).key == 'w' || (e as KeyboardEvent).key == 'ArrowUp') {
          if (playerToMove.y > 0) {
            playerToMove.y -= 10;
          }
        } else if ((e as KeyboardEvent).key == 's' || (e as KeyboardEvent).key == 'ArrowDown') {
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

      if (this.isPlayer == true) {
        this.socket.emit('playerJoin');
      }

      // TODO: send connect
      this.socket.on('pause', () => { this.pausePage(); });
      this.socket.on('youWin', () => { this.winPage(); });
      this.socket.on('youLose', () => { this.losePage(); });

      this.socket.on('start', async (options: GameOptionI, opponent: UserProfile, isLeftSide: boolean, callback: any) => {
        callback('ok');
        this.opponent = opponent;
        this.options = options;
        await this.getAvatars(this.user.userName, opponent.username);
        this.state = State.PLAY;
        this.pong.playerLeft.y = this.pong.canvas.height / 2 - this.pong.playerSize.y / 2;
        this.pong.playerRight.y = this.pong.canvas.height / 2 - this.pong.playerSize.y / 2;
        this.pong.isLeftSide = isLeftSide;
        this.socket.on('opponentMove', async (y: number, callback: any) => {
          callback('ok');
          y = y / 66 * this.pong.canvas.height;
          await this.$nextTick();
          if (this.pong.isLeftSide) {
            this.pong.playerRight.y = y;
          } else {
            this.pong.playerLeft.y = y;
          }
        });
        this.socket.on('ballMove', (pos: PointI, callback: any) => {
          callback('ok');
          this.pong.ball.pos.x = pos.x / 100 * this.pong.canvas.width;
          this.pong.ball.pos.y = pos.y / 66 * this.pong.canvas.height;
        });
        this.socket.on('updateScore', (score: PointI, callback: any) => {
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
    },
    async getAvatars(player: string, opponent: string) {
      await http
        .get("/users/avatar/" + player, {
          responseType: "blob",
        })
        .then((response: any) => {
          const blob = response.data;
          this.imageUser = URL.createObjectURL(blob);
        })
        .catch((error: Error) => {
          console.log(error);
        });
      await http
        .get("/users/avatar/" + opponent, {
          responseType: "blob",
        })
        .then((response: any) => {
          const blob = response.data;
          this.imageOpponent = URL.createObjectURL(blob);
        })
        .catch((error: Error) => {
          console.log(error);
        });
    },
  },
  async mounted() {
    await this.init();
    if (this.$route.name == 'Play') {
      this.isPlayer = true;
    } else if (this.$route.name == 'Spectate') {
      this.isPlayer = false;
      this.state = State.PLAY;
    }
    console.log('user = ', this.user.userName);
    window.addEventListener("beforeunload", () => {
      this.socket.emit('playerLeave');
    });
    this.startPage();
  },
  beforeUnmount() {
    this.socket.emit('playerLeave');
    console.log('player leaved game');
  }
});
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
}

.board {
  width: 100%;
  height: 100vh; //calc(100vh - 155px);
}

#canvas {
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  border: 1px solid rgb(255, 246, 107);
}
</style>
