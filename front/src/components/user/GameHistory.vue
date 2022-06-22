<template>
  <div id="users_list" class="pl-6" style="padding-right: 20px">
      
      <div class="d-flex align-items-center mt-4">
        <h3>{{ title }}</h3>
      </div>

      <div class="container-fluid widebox" style="max-height: 25rem;">
        <table class="table table-borderless" id="users">
          <thead>
            <tr>
              <th scope="col" v-for="column in columns" :key="column">
                {{ column }}
              </th>
            </tr>
          </thead>
          <tbody v-for="match in matchList" :key="match">
            <tr>
                <!-- <th scope="row">{{ currentUser.userName }}</th> -->
                <td scope="row" v-if="match.playerOne.username === username">{{ match.playerTwo.username }}</td>
                <td v-else>{{ match.playerOne.username }}</td>
                <td>{{ match.playerOneScore }}:{{ match.playerTwoScore }}</td>
                <td v-if="username === match.winner.username" style="color: green">Victory</td>
                <td v-else style="color: red">Defeat</td>
                <td>0</td>
            </tr>
          </tbody>
        </table>
      </div>
      
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";

export default defineComponent({
  props: ['username'],
  data() {
    return {
      matchList: [],
      // currentUser: store.getters["auth/getUserProfile"],
      title: 'match history',
      columns: ['Opponent', 'Score', 'result', 'points', ""],
    };
  },

  methods: {
    getMatchList() {
      http
        .get("/users/matchhistory/" + this.username)
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
