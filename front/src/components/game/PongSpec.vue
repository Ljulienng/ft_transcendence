<template lang="html">
  <div class="container board" ref="board">
    <!-- <div class="d-flex ustify-content-between" :width="width"> -->
    <!-- <img :src="this.imageUser" class="profile_avatar_public"
      v-if="state > State.INIT && imageUser && pong.isLeftSide" /> -->
    <!-- <div class="col right" v-if="state > State.INIT && imageOpponent && pong.isLeftSide">
          <img :src="this.imageOpponent" class="profile_avatar_public mx-auto d-block mb-1"
            :style="{ 'top: 50px; left': width / 2 - 50 + 'px' }" />
        </div> -->


    <!-- <div class="col right" v-if="state > State.INIT && imageOpponent && !pong.isLeftSide">
        <img :src="this.imageOpponent" class="profile_avatar_public" />
      </div> -->
    <!-- <div class="col left" v-if="state > State.INIT && imageUser && !pong.isLeftSide">
          <img :src="this.imageUser" class="profile_avatar_public mx-auto d-block mb-1"
            :style="{ 'top: 50px; left': width / 2 - 50 + 'px' }" />
        </div> -->
    <!-- </div> -->
    <canvas id="canvas" ref="canvas" :width="width" :height="height">
      {{ unsupportedMsg }}
    </canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'
import store from '../../store'
import PointI from '../../types/interfaces/point.interface'
import PongI from '../../types/interfaces/pong.interface'
import GameOptionI from '../../types/interfaces/gameoption.interface'
import http from "../../http-common";
/* eslint-disable */

// TODO: waiting for opponent animation
// TODO: Countdown before game start
// TODO: menu for 'win by forfait'

const State = {
  INIT: 0,
  PAUSE: 1,
  PLAY: 2,
  OVER: 3
};

export default defineComponent({
  name: 'PongSpec',
  data() {
    return {
      State: {
        INIT: 0,
        PAUSE: 1,
        PLAY: 2,
        OVER: 3
      },
      socket: store.getters['auth/getUserSocket'],
      user: store.getters['auth/getUserProfile'],
      imageUser: null as any,
      opponent: null as any,
      imageOpponent: null as any,
      pong: {} as PongI,
      options: {} as GameOptionI,
      state: State.INIT,
      unsupportedMsg: 'Sorry, your browser does not support canvas.',
      width: 640,
      height: 480,
      winner: '',
      playerLeftName: '',
      playerRightName: ''
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
      this.state = State.INIT;
      this.options = {
        theme: { name: 'dark', bgColor: '#1c1d21', fgColor: 'lightgrey' },
        winScore: 5
      };
      window.addEventListener("resize", this.onResize);
      await this.onResize();
    },
    overPage() {
      this.state = State.OVER;
      this.pong.context.fillStyle = this.options.theme.bgColor;
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);
      this.pong.context.font = '64px Orbitron';
      this.pong.context.textAlign = 'center';
      this.pong.context.textBaseline = "middle";
      if (this.winner && this.winner != '') {
        this.pong.context.fillStyle = 'green';
        this.pong.context.fillText(this.winner.toLocaleUpperCase() + ' WIN', this.pong.canvas.width / 2, this.pong.canvas.height / 2, this.pong.canvas.width);
      } else {
        this.pong.context.fillStyle = 'yellow';
        this.pong.context.fillText('Game aborted :(', this.pong.canvas.width / 2, this.pong.canvas.height / 2, this.pong.canvas.width);
      }
      setTimeout(() => {
        if (this.$route.name == 'Spectate') {
          this.$router.push('/');
        }
      }, 3000);
    },
    pausePage() {
      if (this.state == State.OVER) {
        return;
      }
      this.state = State.PAUSE;
      this.pong.context.fillStyle = this.options.theme.bgColor;
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);
      this.pong.context.fillStyle = this.options.theme.fgColor;
      this.pong.context.textAlign = 'center';
      this.pong.context.font = '40px Orbitron';
      this.pong.context.textBaseline = "middle";
      this.pong.context.fillText('Waiting for players...', this.pong.canvas.width / 2, this.pong.canvas.height / 2, this.pong.canvas.width);
    },
    draw(): void {
      switch (this.state) {
        case State.PAUSE:
          return this.pausePage();
        case State.OVER:
          return;
      }

      // Draw fields
      this.pong.context.fillStyle = this.options.theme.bgColor;
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);

      // Draw middle lines
      this.pong.context.strokeStyle = this.options.theme.fgColor;
      this.pong.context.beginPath();
      this.pong.context.moveTo(this.pong.canvas.width / 2, 0);
      this.pong.context.lineTo(this.pong.canvas.width / 2, this.pong.canvas.height);
      this.pong.context.stroke();

      // Draw scores
      this.pong.context.fillStyle = this.options.theme.fgColor;
      this.pong.context.font = '32px Orbitron';
      this.pong.context.textAlign = 'center';
      this.pong.context.textBaseline = "middle";
      this.pong.context.fillText(this.pong.playerLeft.score.toString(), this.pong.canvas.width / 4, 32, this.pong.canvas.width);
      this.pong.context.fillText(this.pong.playerRight.score.toString(), (this.pong.canvas.width / 4) * 3, 32, this.pong.canvas.width);

      // Draw usernames
      this.pong.context.fillStyle = this.options.theme.fgColor;
      this.pong.context.font = '32px Orbitron';
      this.pong.context.textAlign = 'center';
      this.pong.context.textBaseline = "middle";
      this.pong.context.globalAlpha = 0.5;
      this.pong.context.fillText(this.playerLeftName, this.pong.canvas.width / 4, this.pong.canvas.height / 2, this.pong.canvas.width);
      this.pong.context.fillText(this.playerRightName, (this.pong.canvas.width / 4) * 3, this.pong.canvas.height / 2, this.pong.canvas.width);
      this.pong.context.globalAlpha = 1;

      // Draw playerLeft
      this.pong.context.fillStyle = this.options.theme.fgColor;
      this.pong.context.fillRect(0, this.pong.playerLeft.y, this.pong.playerSize.x, this.pong.playerSize.y);

      // Draw playerRight
      this.pong.context.fillStyle = this.options.theme.fgColor;
      this.pong.context.fillRect(this.pong.canvas.width - this.pong.playerSize.x, this.pong.playerRight.y, this.pong.playerSize.x, this.pong.playerSize.y);

      // Draw ball
      this.pong.context.beginPath();
      this.pong.context.fillStyle = this.options.theme.fgColor;
      this.pong.context.arc(this.pong.ball.pos.x, this.pong.ball.pos.y, this.pong.ball.radius, 0, Math.PI * 2, false);
      this.pong.context.fill();
    },
    onReady() {
      this.pausePage();
      this.socket.on('pause', () => { this.pausePage(); });
      this.socket.on('gameOver', (winner: string) => {
        this.winner = winner;
        this.overPage();
      });
      this.socket.on('playerMove', async (isLeftSide: boolean, y: number) => {
        if (isLeftSide) {
          this.pong.playerLeft.y = y / 66 * this.pong.canvas.height;
        } else {
          this.pong.playerRight.y = y / 66 * this.pong.canvas.height;
        }
      });
      this.socket.on('ballMove', (pos: PointI) => {
        this.pong.ball.pos.x = pos.x / 100 * this.pong.canvas.width;
        this.pong.ball.pos.y = pos.y / 66 * this.pong.canvas.height;
      });
      this.socket.on('updateScore', (score: PointI) => {
        this.pong.playerLeft.score = score.x;
        this.pong.playerRight.score = score.y;
      });
      this.socket.on('startSpec', async (options: GameOptionI, playerLeft: string, playerRight: string) => {
        if (options) {
          this.options = options;
        }
        this.playerLeftName = playerLeft;
        this.playerRightName = playerRight;
        this.state = State.PLAY;
        await this.getAvatars(this.playerLeftName, this.playerRightName); // TODO:
        this.play();
      });
    },
    play() {
      this.draw();
      requestAnimationFrame(this.play);
    },
    async onResize() {
      if (this.$route.name != 'Spectate' || !this.$refs.board) {
        return;
      }
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
    this.onReady();
  },
  beforeUnmount() {
    this.socket.volatile.emit('playerLeave');
  }
});
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: calc(100vh - 50px);
}

#canvas {
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  border: 1px solid rgb(255, 246, 107);
  // margin-top: 50px;
}

.profile_avatar_public {
  position: absolute;
  top: 0px;
  left: 0px;
  opacity: 0.5;
  vertical-align: middle;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #fff774;
}
</style>
