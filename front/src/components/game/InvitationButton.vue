<template>
  <button @click="matchInvitation()">
    <span class="material-icons px-1" style="color: white">sports_esports</span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  props: ["userToInvite", "socket"],

  methods: {
    matchInvitation() {
      
      this.socket.emit("matchInvitation", this.userToInvite);
    }
  }
})
</script>
