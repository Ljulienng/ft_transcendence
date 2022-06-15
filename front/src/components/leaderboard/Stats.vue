<template>
  <tr>
    <th scope="row">{{ user.username }}</th>
    <td>{{ userStats.total }}</td>
    <td>{{ userStats.gameWon }}</td>
    <td>{{ userStats.gameLost }}</td>
    <td>{{ userStats.ranking }}</td>
    <td>{{ userStats.points }}</td>
  </tr>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";

export default defineComponent({
  props: ["user"],

  data() {
    return {
      x: this.user,
      //   stats: any,
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
    async getStats() {
      try {
        const response = await http.get("/users/stats");

        this.userStats = response.data;
        this.userStats.total = this.userStats.gameWon + this.userStats.gameLost;
      } catch (error) {
        console.log(error);
      }
    },
  },

  created() {
    this.getStats();
  },
});
</script>

<style lang="scss"></style>
