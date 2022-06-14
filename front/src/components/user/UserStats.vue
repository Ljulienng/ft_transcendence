<template>
  <div class="d-block">
    <h4 style="color: white" class="pb-3 fw-bold">
      <i style="color: #fff774" class="material-icons">sports_tennis</i> {{ userStats.total }} games played 
    </h4>
    <h4 style="color: white" class="pb-3 fw-bold">
      <i style="color: #fff774" class="material-icons">military_tech</i> {{ userStats.gameWon }} games won
    </h4>
    <h4 style="color: white" class="pb-3 fw-bold">
      <i style="color: #fff774" class="material-icons">cancel</i> {{ userStats.gameLost }} games lost
    </h4>
    <h4 style="color: white" class="pb-3 fw-bold">
      <i style="color: #fff774" class="material-icons">leaderboard</i> {{ userStats.ranking }} ranking
    </h4>
    <h4 style="color: white" class="fw-bold">
      <i style="color: #fff774" class="material-icons">stars</i> {{ userStats.points }} points
    </h4>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";
// import store from "../../store";

export default defineComponent({
  props: ['username'],

  data() {
    return {
      userStats: {
        total: 0,
        gameWon: 0,
        gameLost: 0,
        ranking: 0,
        points: 0,
      },
    };
  },

  methods: {
    getUserStats() {
      http
        .get("/users/stats/" + this.username)
        .then((response) => {
          console.log(response.data);
          this.userStats.gameWon = response.data.gameWon;
          this.userStats.gameLost = response.data.gameLost;
          this.userStats.ranking = response.data.ranking;
          this.userStats.points = response.data.points;
          this.userStats.total =
            this.userStats.gameWon + this.userStats.gameLost;
        })
        .catch((error) => {
          console.log("stats error = ", error);
        });
    },
  },

  created() {
    this.getUserStats();
    console.log("created = ", this.userStats);
  },
});
</script>
