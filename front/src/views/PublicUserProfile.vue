<template>
  <div class="userProfile mx-auto p-4">
    <!-- <div class="avatar"> -->
    <div class="d-flex mx-auto justify-content-evenly" style="width:70%">
      <div class="d-block text-center">
        <img :src="this.image" class="profile_avatar_public" />
        <p class="primary text-decoration-none display-5" style="color: #fff774">{{ userInfo.username }}</p>
      </div>
      <UserStats v-if="userInfo.username !== ''" v-bind:username="userInfo.username" />
    </div>
    <GameHistory v-if="userInfo.username !== ''" v-bind:username="userInfo.username" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import UserStats from "../components/user/UserStats.vue";
import GameHistory from "../components/user/GameHistory.vue";
import http from "../http-common";


export default defineComponent({
  components: {
    UserStats,
    GameHistory
  },

  data() {
    return {
      userInfo: {
        username: "",
        total: 0,
        gameWon: 0,
        gameLost: 0,
        ranking: 0,
        points: 0,
        matchHistory: [],
      },
      // eslint-disable-next-line
      image: null as any,
      // userInfo: []
    };
  },

  methods: {
    async getuserInfo() {
      await http
        .get("/users/public/" + this.$route.params.username)
        .then((response) => {
          this.userInfo = response.data;
        })
        .catch(() => {
          console.log("");
        });
    },
    async getAvatar() {
      http
        .get("/users/avatar/" + this.$route.params.username, {
          responseType: "blob",
        })
        .then((response) => {
          const blob = response.data;

          this.image = URL.createObjectURL(blob);
        })
        .catch(() => {
          console.log("");
        });
    },
  },

  created() {
    this.getuserInfo();
    this.getAvatar();
  },
});
</script>
