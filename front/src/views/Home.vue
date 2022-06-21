<template>
  <div class="body" style="padding-left: 100px; padding-right: 20px">
    <div class="welcome">
      Welcome, {{ getUserProfile.userName }} you are {{ getUserProfile.status }}
    </div>
    <div class="split">
      <div class="lcol">
        <div class="centered">
          <h4>points to victory</h4>
          <div>
            <button class="left_arrow" @click="decrementWinScore"></button>
            <p class="point2win">{{ winScores.at(winScoreIndex) }}</p>
            <button class="right_arrow" @click="incrementWinScore"></button>
          </div>
          <br />
          <h4>theme</h4>
          <div>
            <button class="left_arrow" @click="decrementTheme"></button>
            <p class="theme">{{ themes.at(themeIndex).name }}</p>
            <button class="right_arrow" @click="incrementTheme"></button>
          </div>
          <br />
          <button class="mybtn" @click="play">play</button>
        </div>
      </div>
      <div class="rcol">
        <div class="left-aligned">
          <h1>tran</h1>
          <h1>scen</h1>
          <h1>dence.</h1>
          <br />
        </div>
      </div>
      <div style="clear: both"></div>
    </div>
  </div>
</template>

<script lang="ts">
import "../assets/css/style.scss";
import { defineComponent } from "@vue/runtime-core";
import store from "../store";
import http from "../http-common";
import GameOptionI from "@/types/interfaces/gameoption.interface";
/* eslint-disable */

export interface UserProfile {
  id: number;
  userName: string;
  email: string;
  status: string;
}

export default defineComponent({
  name: "Home",
  data() {
    return {
      getUserProfile: {} as UserProfile,
      socket: store.getters['auth/getUserSocket'],
      winScores: [3, 5],
      winScoreIndex: 0,
      themes: [
        { name: 'dark', bgColor: '#1c1d21', fgColor: 'lightgrey' },
        { name: 'light', bgColor: 'lightgrey', fgColor: '#1c1d21' }
      ],
      themeIndex: 0
    };
  },

  methods: {
    setUser() {
      this.getUserProfile = store.getters["auth/getUserProfile"];
    },
    connectUser() {
      const userSocket = store.getters["auth/getUserSocket"].id;

      if (!userSocket) store.dispatch("auth/setUserSocket");
      store.dispatch("auth/setUserStatus", "Online");
    },
    getId() {
      const userId = store.getters["auth/getUserProfile"].id;
      const userSocket = store.getters["auth/getUserSocket"].id;
      if (userId) console.log("userId = ", userId);
      // if (userSocket)
      console.log("userSocket = ", userSocket);
      return userId;
    },
    setStatus() {
      http
        .post("/users/setstatus", { newStatus: "Online" })
        .then((res: any) => {
          console.log(res);
        })
        .catch((err: Error) => {
          console.log(err);
        });
    },
    incrementTheme() {
      if (this.themeIndex < this.themes.length - 1) {
        this.themeIndex += 1;
      } else {
        this.themeIndex = 0;
      }
    },
    decrementTheme() {
      if (this.themeIndex > 0) {
        this.themeIndex -= 1;
      } else {
        this.themeIndex = this.themes.length - 1;
      }
    },
    incrementWinScore() {
      if (this.winScoreIndex < this.winScores.length - 1) {
        this.winScoreIndex += 1;
      } else {
        this.winScoreIndex = 0;
      }
    },
    decrementWinScore() {
      if (this.winScoreIndex > 0) {
        this.winScoreIndex -= 1;
      } else {
        this.winScoreIndex = this.winScores.length - 1;
      }
    },
    async play() {
      const options: GameOptionI = {
        theme: this.themes[this.themeIndex],
        winScore: this.winScores[this.winScoreIndex]
      };
      this.socket.volatile.emit('playerRegister', options);
      this.$router.push('/play');
    }
  },
  beforeMount() {  // TODO: do earlier ?
    // if player is in game, redirect it to its game
    this.socket.volatile.emit('amIInGame', (amIInGame: boolean) => {
      if (amIInGame == true) {
        this.socket.volatile.emit('playerReconnect');
        this.$router.push('/play');
      }
    });
    setTimeout(() => {
      this.socket.volatile.emit('amIInGame', (amIInGame: boolean) => {
        if (amIInGame == true) {
          this.socket.volatile.emit('playerReconnect');
          this.$router.push('/play');
        }
      });
    }, 100);
  },
  created() {
    this.setUser();
    // if (this.getUserProfile.status === "Offline") this.connectUser();
  },
});
</script>

<style src="../assets/css/home.css" scoped>
</style>
