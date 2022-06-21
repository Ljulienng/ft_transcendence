<template>
  <button @click="matchInvitation()">
    <span class="material-icons px-1" style="color: white">sports_esports</span>
  </button>
</template>

<script lang="ts">
import store from "../../store";
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  props: ["userToInvite", "socket"],
  data() {
    return ({
      user: store.getters["auth/getUserProfile"],
    });
  },
  methods: {
    matchInvitation() {
      console.log(this.user, this.userToInvite);
      this.socket.emit("matchInvitation", this.userToInvite);
    }
  },
})
</script>
