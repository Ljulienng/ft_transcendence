<template>
  <div class="test">
    <h2>Blocked users</h2>
    <ul>
      <li v-for="blocked in blockedList" :key="blocked">
        {{ blocked.username }}
        <button v-on:click="unblockUser(blocked.id)" class="btn btn-danger">BLOCK</button>
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
      blockedList: [],
      currentUser: store.getters["auth/getUserProfile"],
      socket: store.getters["auth/getUserSocket"],
    };
  },

  methods: {
    async getBlockedList() {
      const response = await http.get("/users/getblocked");

      this.blockedList = response.data
      console.log("blockedList after get = ", this.blockedList);
    },

    unblockUser(userToUnblock: number) {
      this.socket.emit("unblockUser", userToUnblock);
    },

  },

  mounted() {
    this.socket.on("updateBlocked/" + this.currentUser.id, () => {
      this.getBlockedList();
    });
  },

  created() {
    this.getBlockedList();
  },
});
</script>

<style lang="scss">
// .blockedList {
// 	w
// }
</style>
