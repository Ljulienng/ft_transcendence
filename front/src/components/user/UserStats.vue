<template>
  <div>
    <h2>Stats</h2>
    <p style="color: white">
      Total: {{ userStats.total }} Game won: {{ userStats.gameWon }} Game lost:
      {{ userStats.gameLost }} ranking: {{ userStats.ranking }} points:
      {{ userStats.points }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";
// import store from "../../store";

export default defineComponent({
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
        .get("/users/stats")
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
