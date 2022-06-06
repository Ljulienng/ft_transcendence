<template>
  <div class="gameHistory">
    <h2>Match History</h2>
    <ul>
      <li v-for="match in matchList" :key="match">
        <p v-if="currentUser.userName === match.winner" style="color: green">
          {{ match.playerOne.username }} | {{ match.playerTwo.username }} |
          {{ match.playerOneScore }}:{{ match.playerTwoScore }}
        </p>
        <p v-else style="color: red">
          {{ currentUser.username }}
          {{ match.playerOne.username }} | {{ match.playerTwo.username }} |
          {{ match.playerOneScore }}:{{ match.playerTwoScore }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";
import store from "../../store";

export default defineComponent({
  data() {
    return {
      matchList: [],
      currentUser: store.getters["auth/getUserProfile"],
    };
  },

  methods: {
    getMatchList() {
      http
        .get("/users/matchhistory")
        .then((response) => {
          console.log(response.data);
          this.matchList = response.data;
        })
        .catch((error) => {
          console.log("match history error = ", error);
        });
    },
  },
  created() {
    this.getMatchList();
  },
});
</script>

<style lang="scss"></style>
