<template lang="html">
  <div class="container board" ref="board" @mousemove="onMove" @keydown="onMove">
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
import { defineComponent } from "@vue/runtime-core";
import store from "../../store";
import PointI from "../../types/interfaces/point.interface";
import PongI from "../../types/interfaces/pong.interface";
import GameOptionI from "../../types/interfaces/gameoption.interface";
import http from "../../http-common";
/* eslint-disable */

// TODO: waiting for opponent animation
// TODO: Countdown before game start
// TODO: menu for 'win by forfait'

const WIDTH = 100;
const HEIGHT = 66;

const State = {
  INIT: 0,
  PAUSE: 1,
  PLAY: 2,
  WIN: 3,
  LOSE: 4,
};

export default defineComponent({
  name: "Pong",
  data() {
    return {
      State: {
        INIT: 0,
        PAUSE: 1,
        PLAY: 2,
        WIN: 3,
        LOSE: 4,
      },
      socket: store.getters["auth/getUserSocket"],
      user: store.getters["auth/getUserProfile"],
      imageUser: null as any,
      opponent: null as any,
      imageOpponent: null as any,
      pong: {} as PongI,
      options: {} as GameOptionI,
      state: State.INIT,
      unsupportedMsg: "Sorry, your browser does not support canvas.",
      width: 640,
      height: 480,
    };
  },
  methods: {
    async init() {
      this.pong.canvas = document.getElementById("canvas") as HTMLCanvasElement;
      this.pong.context = this.pong.canvas.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
      this.pong.playerSize = {
        x: this.pong.canvas.width / 128,
        y: this.pong.canvas.height / 8,
      };
      this.pong.playerRight = {
        y: this.pong.canvas.height / 2 - this.pong.playerSize.y / 2,
        score: 0,
      };
      this.pong.playerLeft = {
        y: this.pong.canvas.height / 2 - this.pong.playerSize.y / 2,
        score: 0,
      };
      this.pong.ball = {
        pos: {
          x: this.pong.canvas.width / 2,
          y: this.pong.canvas.width / 2,
        },
        radius: 5,
      };
      this.pong.isLeftSide = false;
      this.state = State.INIT;
      this.options = {
        theme: { name: "dark", bgColor: "#1c1d21", fgColor: "lightgrey" },
        winScore: 5,
      };
      window.addEventListener("resize", this.onResize);
      await this.onResize();
    },
    startPage() {
      this.pong.context.fillStyle = this.options.theme.bgColor;
      this.pong.context.fillRect(
        0,
        0,
        this.pong.canvas.width,
        this.pong.canvas.height
      );
      this.pong.context.fillStyle = this.options.theme.fgColor;
      this.pong.context.font = "64px Orbitron";
      this.pong.context.textAlign = "center";
      this.pong.context.textBaseline = "middle";
      this.pong.context.fillText(
        "CLICK TO START",
        this.pong.canvas.width / 2,
        this.pong.canvas.height / 2,
        this.pong.canvas.width
      );
    },
    losePage() {
      this.state = State.LOSE;
      this.pong.context.fillStyle = this.options.theme.bgColor;
      this.pong.context.fillRect(
        0,
        0,
        this.pong.canvas.width,
        this.pong.canvas.height
      );
      this.pong.context.fillStyle = "red";
      this.pong.context.font = "64px Orbitron";
      this.pong.context.textAlign = "center";
      this.pong.context.textBaseline = "middle";
      this.pong.context.fillText(
        "YOU LOSE",
        this.pong.canvas.width / 2,
        this.pong.canvas.height / 2,
        this.pong.canvas.width
      );
    },
    winPage() {
      this.state = State.WIN;
      this.pong.context.fillStyle = this.options.theme.bgColor;
      this.pong.context.fillRect(
        0,
        0,
        this.pong.canvas.width,
        this.pong.canvas.height
      );
      this.pong.context.fillStyle = "green";
      this.pong.context.font = "64px Orbitron";
      this.pong.context.textAlign = "center";
      this.pong.context.textBaseline = "middle";
      this.pong.context.fillText(
        "YOU WIN",
        this.pong.canvas.width / 2,
        this.pong.canvas.height / 2,
        this.pong.canvas.width
      );
    },
    pausePage() {
      if (this.state == State.WIN || this.state == State.LOSE) {
        return;
      }
      this.state = State.PAUSE;
      this.pong.context.fillStyle = this.options.theme.bgColor;
      this.pong.context.fillRect(
        0,
        0,
        this.pong.canvas.width,
        this.pong.canvas.height
      );
      this.pong.context.fillStyle = this.options.theme.fgColor;
      this.pong.context.textAlign = "center";
      this.pong.context.font = "40px Orbitron";
      this.pong.context.textBaseline = "middle";
      this.pong.context.fillText(
        "Waiting for opponent...",
        this.pong.canvas.width / 2,
        this.pong.canvas.height / 2,
        this.pong.canvas.width
      );
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
      this.pong.context.fillStyle = this.options.theme.bgColor;
      this.pong.context.fillRect(0, 0, this.pong.canvas.width, this.pong.canvas.height);

      // Draw middle lines
      this.pong.context.strokeStyle = this.options.theme.fgColor;
      this.pong.context.beginPath();
      this.pong.context.moveTo(this.pong.canvas.width / 2, 0);
      this.pong.context.lineTo(
        this.pong.canvas.width / 2,
        this.pong.canvas.height
      );
      this.pong.context.stroke();

      // Draw scores
      this.pong.context.fillStyle = this.options.theme.fgColor;
      this.pong.context.font = "32px Orbitron";
      this.pong.context.textAlign = "center";
      this.pong.context.textBaseline = "middle";
      this.pong.context.fillText(
        this.pong.playerLeft.score.toString(),
        this.pong.canvas.width / 4,
        32,
        this.pong.canvas.width
      );
      this.pong.context.fillText(
        this.pong.playerRight.score.toString(),
        (this.pong.canvas.width / 4) * 3,
        32,
        this.pong.canvas.width
      );

      // Draw pictures
      if (this.imageUser) {
        this.pong.context.drawImage(this.pong.isLeftSide ? this.imageUser : this.imageOpponent, this.pong.canvas.width / 4 - 25, this.pong.canvas.height / 2 + 55, 50, 50);
      }
      if (this.imageOpponent) {
        this.pong.context.drawImage(this.pong.isLeftSide ? this.imageOpponent : this.imageUser, this.pong.canvas.width / 4 * 3 - 25, this.pong.canvas.height / 2 + 55, 50, 50);
      }
      // Draw usernames
      this.pong.context.fillStyle = this.options.theme.fgColor;
      this.pong.context.font = "32px Orbitron";
      this.pong.context.textAlign = "center";
      this.pong.context.textBaseline = "middle";
      this.pong.context.globalAlpha = 0.5;
      this.pong.context.fillText(
        this.pong.isLeftSide ? this.user.userName : this.opponent.username,
        this.pong.canvas.width / 4,
        this.pong.canvas.height / 2,
        this.pong.canvas.width
      );
      this.pong.context.fillText(
        this.pong.isLeftSide ? this.opponent.username : this.user.userName,
        (this.pong.canvas.width / 4) * 3,
        this.pong.canvas.height / 2,
        this.pong.canvas.width
      );
      this.pong.context.globalAlpha = 1;
      this.pong.context.beginPath();


      // Draw playerLeft
      this.pong.context.fillStyle = this.options.theme.fgColor;
      this.pong.context.fillRect(
        0,
        this.pong.playerLeft.y,
        this.pong.playerSize.x,
        this.pong.playerSize.y
      );

      // Draw playerRight
      this.pong.context.fillStyle = this.options.theme.fgColor;
      this.pong.context.fillRect(
        this.pong.canvas.width - this.pong.playerSize.x,
        this.pong.playerRight.y,
        this.pong.playerSize.x,
        this.pong.playerSize.y
      );

      // Draw ball
      this.pong.context.beginPath();
      this.pong.context.fillStyle = this.options.theme.fgColor;
      this.pong.context.arc(
        this.pong.ball.pos.x,
        this.pong.ball.pos.y,
        this.pong.ball.radius,
        0,
        Math.PI * 2,
        false
      );
      this.pong.context.fill();
    },
    onMove(e: Event) {
      if (this.state != State.PLAY) return;
      const playerToMove = this.pong.isLeftSide
        ? this.pong.playerLeft
        : this.pong.playerRight;
      if (e.type == "mousemove") {
        let rect = this.pong.canvas.getBoundingClientRect();
        let mouseLocation =
          (((e as MouseEvent).clientY - rect.top) / (rect.bottom - rect.top)) *
          this.pong.canvas.height;
        if (
          mouseLocation >
          this.pong.canvas.height - this.pong.playerSize.y / 2
        ) {
          playerToMove.y = this.pong.canvas.height - this.pong.playerSize.y;
        } else {
          playerToMove.y = mouseLocation - this.pong.playerSize.y / 2;
        }
      } else if (e.type == "keydown") {
        if (
          (e as KeyboardEvent).key == "w" ||
          (e as KeyboardEvent).key == "ArrowUp"
        ) {
          if (playerToMove.y > 0) {
            playerToMove.y -= 10;
          }
        } else if (
          (e as KeyboardEvent).key == "s" ||
          (e as KeyboardEvent).key == "ArrowDown"
        ) {
          if (
            playerToMove.y <
            this.pong.canvas.height - this.pong.playerSize.y
          ) {
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
      this.socket.volatile.emit("playerMove", {
        x: playerToMove.y,
        y: this.pong.canvas.height,
      });
    },
    onReady() {
      this.socket.on("pause", () => {
        this.pausePage();
      });
      this.socket.on("youWin", () => {
        setTimeout(() => {
          if (this.$route.name == "Pong") { // TODO: do not work
            this.$router.push("/");
          }
        }, 3000);
        this.winPage();
      });
      this.socket.on("youLose", () => {
        setTimeout(() => {
          console.log(this.$route.name);
          if (this.$route.name == "Pong") {
            this.$router.push("/"); // TODO: do not work
          }
        }, 3000);
        this.losePage();
      });
      this.socket.on("opponentMove", async (y: number) => {
        y = (y / HEIGHT) * this.pong.canvas.height;
        await this.$nextTick();
        if (this.pong.isLeftSide) {
          this.pong.playerRight.y = y;
        } else {
          this.pong.playerLeft.y = y;
        }
      });
      this.socket.on("ballMove", (pos: PointI) => {
        this.pong.ball.pos.x = (pos.x / WIDTH) * this.pong.canvas.width;
        this.pong.ball.pos.y = (pos.y / HEIGHT) * this.pong.canvas.height;
      });
      this.socket.on("updateScore", (score: PointI) => {
        this.pong.playerLeft.score = score.x;
        this.pong.playerRight.score = score.y;
      });
      this.socket.on(
        "start",
        async (options: GameOptionI, opponent: any, isLeftSide: boolean) => {
          this.opponent = opponent;
          this.options = options;
          await this.getAvatars(this.user.userName, opponent.username);
          this.state = State.PLAY;
          this.pong.playerLeft.y =
            this.pong.canvas.height / 2 - this.pong.playerSize.y / 2;
          this.pong.playerRight.y =
            this.pong.canvas.height / 2 - this.pong.playerSize.y / 2;
          this.pong.isLeftSide = isLeftSide;
          await this.$nextTick();
          this.play();
        }
      );
      // TODO: countdown before game start
    },
    play() {
      this.draw();
      requestAnimationFrame(this.play);
    },
    async onResize() {
      if (this.$route.name != "Play" || !this.$refs.board) {
        return;
      }
      await this.$nextTick();
      if (
        (this.$refs.board as HTMLDivElement).offsetWidth * 0.66 <=
        (this.$refs.board as HTMLDivElement).offsetHeight
      ) {
        this.width = (this.$refs.board as HTMLDivElement).offsetWidth * 0.98;
        this.height =
          (this.$refs.board as HTMLDivElement).offsetWidth * 0.66 * 0.98;
      } else if (
        (this.$refs.board as HTMLDivElement).offsetHeight * 1.33 <=
        (this.$refs.board as HTMLDivElement).offsetWidth
      ) {
        this.height = (this.$refs.board as HTMLDivElement).offsetHeight * 0.98;
        this.width =
          (this.$refs.board as HTMLDivElement).offsetHeight * 1.33 * 0.98;
      }
      await this.$nextTick();
      this.pong.playerSize.x = this.pong.canvas.width / 100;
      this.pong.playerSize.y = this.pong.canvas.height / 3.3;
      this.pong.ball.radius = this.pong.canvas.width / WIDTH;
      await this.$nextTick();
      this.draw();
    },
    async getAvatars(player: string, opponent: string) {
      await http
        .get("/users/avatar/" + player, {
          responseType: "blob",
        })
        .then(async (response: any) => {
          const blob = response.data;
          //this.imageUser = URL.createObjectURL(blob);
          this.imageUser = await createImageBitmap(blob, { resizeWidth: 50, resizeHeight: 50, resizeQuality: 'high' });
        })
        .catch((error: Error) => {
          console.log(error);
        });
      await http
        .get("/users/avatar/" + opponent, {
          responseType: "blob",
        })
        .then(async (response: any) => {
          const blob = response.data;
          this.imageOpponent = await createImageBitmap(blob, { resizeWidth: 50, resizeHeight: 50, resizeQuality: 'high' });
          // this.imageOpponent = URL.createObjectURL(blob);
        })
        .catch((error: Error) => {
          console.log(error);
        });
    },
  },
  async mounted() {
    await this.init();
    this.socket.volatile.emit("playerReconnect", (isReconnected: boolean) => {
      if (isReconnected == false) {
        this.$router.push("/"); // TODO: do earlier ?
        return;
      }
    });
    setTimeout(() => {
      this.socket.volatile.emit("playerReconnect", (isReconnected: boolean) => {
        if (isReconnected == false) {
          this.$router.push("/");
          return;
        }
      });
    }, 100);
    this.pausePage();
    this.onReady();
  },
  beforeUnmount() {
    this.socket.volatile.emit("playerLeave");
  },
});
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: calc(100vh - 50px);
}

#canvas {
  font-family: "Orbitron", sans-serif;
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
