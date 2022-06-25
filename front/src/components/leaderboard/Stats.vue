<template>
  <tr>
    <th scope="row" class="text-center">{{ userStats.ranking }}</th>
    <td class="text-left" style="width: 17rem">
      <router-link
        :to="'/public/' + currentUser.username"
        class="button text-right text-decoration-none"
      >
        <img :src="this.image" class="profile_avatar_small" />
        {{ currentUser.username }}
      </router-link>
    </td>
    <td class="text-center">{{ userStats.total }}</td>
    <td class="text-center">{{ userStats.gameWon }}</td>
    <td class="text-center">{{ userStats.gameLost }}</td>
    <td class="text-center">{{ userStats.points }}</td>
  </tr>
</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";

export default defineComponent({
  props: ["user"],

  data() {
    return {
      currentUser: this.user,
      //   stats: any,
      userStats: {
        total: 0,
        gameWon: 0,
        gameLost: 0,
        ranking: 0,
        points: 0,
      },
      image: null as any,
    };
  },

  methods: {
    async getStats() {
      try {
        this.userStats = this.currentUser;
        this.userStats.total =
          this.currentUser.gameWon + this.currentUser.gameLost;
      } catch (error) {
        console.log(error);
      }
    },
    async getAvatar() {
      http
        .get("/users/avatar/" + this.currentUser.username, {
          responseType: "blob",
        })
        .then((response) => {
          const blob = response.data;

          this.image = URL.createObjectURL(blob);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },

  created() {
    this.getStats();
    this.getAvatar();
  },
});
</script>

<style lang="scss"></style>
