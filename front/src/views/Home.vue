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
            <button class="left_arrow"></button>
            <p class="point2win">3</p>
            <button class="right_arrow"></button>
          </div>
          <br />
          <h4>theme</h4>
          <div>
            <button class="left_arrow"></button>
            <p class="theme">classic</p>
            <button class="right_arrow"></button>
          </div>
          <br />
          <button class="mybtn">play</button>
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
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    },

  },

  mounted() {
  },

  created() {
    this.setUser();
    if (this.getUserProfile.status === "Offline") this.connectUser();
    // this.getId();

    // this.setStatus()
  },
});
</script>

<style src="../assets/css/home.css" scoped></style>
