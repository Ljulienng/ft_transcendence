<template>
  <div class="blockedList">
    <ul>
      <li v-for="user in blockedList" :key="user">
        {{ user.username }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";
import store from "../../store";

export default defineComponent({
  components: {},

  data() {
    return {
      blockedList: [],
      currentUser: store.getters["auth/getUserProfile"],
      socket: store.getters["auth/getUserSocket"],
    };
  },

  methods: {
    async getBlockedList() {
      this.blockedList = await http.get("/users/getblocked");
      console.log("blockedList = ", this.blockedList);
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
