<template>
  <div class="body" style="padding-left: 100px; padding-right: 20px">
    <div class="welcome">
      Welcome, {{ getUserProfile.userName }} you are {{ getUserProfile.status }}
    </div>
    <div class="split">
      <div class="lcol">
        <Options></Options>
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
import Options from "../components/game/Options.vue";
/* eslint-disable */

export interface UserProfile {
  id: number;
  userName: string;
  email: string;
  status: string;
}

export default defineComponent({
  name: "Home",
  components: { Options },
  data() {
    return {
      getUserProfile: {} as UserProfile,
      socket: store.getters["auth/getUserSocket"]
    };
  },
  methods: {
    setUser() {
      this.getUserProfile = store.getters["auth/getUserProfile"];
    },
    connectUser() {
      const userSocket = store.getters["auth/getUserSocket"].id;
      if (!userSocket)
        store.dispatch("auth/setUserSocket");
      store.dispatch("auth/setUserStatus", "Online");
    },
    getId() {
      const userId = store.getters["auth/getUserProfile"].id;
      const userSocket = store.getters["auth/getUserSocket"].id;
      if (userId)
        console.log("userId = ", userId);
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
    }
  },
  beforeMount() {
    // if player is in game, redirect it to its game
    this.socket.volatile.emit("amIInGame", (amIInGame: boolean) => {
      if (amIInGame == true) {
        this.socket.volatile.emit("playerReconnect");
        this.$router.push("/play");
      }
    });
    setTimeout(() => {
      this.socket.volatile.emit("amIInGame", (amIInGame: boolean) => {
        if (amIInGame == true) {
          this.socket.volatile.emit("playerReconnect");
          this.$router.push("/play");
        }
      });
    }, 100);
  },
  created() {
    this.setUser();
    // if (this.getUserProfile.status === "Offline") this.connectUser();
  }
});
</script>

<style src="../assets/css/home.css" scoped>
</style>
