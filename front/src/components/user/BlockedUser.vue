<template>
  <div class="test">
    <!-- <h2>Blocked users</h2>
    <ul>
      <li v-for="blocked in blockedList" :key="blocked">
        {{ blocked.username }}
        <button v-on:click="unblockUser(blocked.id)" class="btn btn-danger">
          UNBLOCK -->
    <ul class="list-group mb-2 mt-2">
      <li class="list-group-item bg-transparent border-0 text-grey d-flex justify-content-between">
          <div class="col">username</div>
          <div class="col align-middle">firstname</div>
          <div class="col align-middle">lastname</div>
          <div class="col align-middle">status</div>
          <p class="invisible">del</p>
          <p class="invisible">block</p>
        </li>
      <li 
        v-for="blocked in blockedList"
        :key="blocked"
        class="list-group-item bg-transparent border-0 text-white d-flex justify-content-between"
      >
        <div class="col">{{ blocked.username }}</div>
        <div class="col align-middle">{{ blocked.firstname }}</div>
        <div class="col align-middle">{{ blocked.lastname }}</div>
        <div class="col align-middle">{{ blocked.status }}</div>
        <button v-on:click="unblockUser(blocked.id)">
          <span class="material-icons px-1">clear</span>
        </button>
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

      this.blockedList = response.data;
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
