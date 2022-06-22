<template>
  <button @click="matchSpectate()">
    <span class="material-icons px-0" style="color: white">visibility</span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  props: ["userToSpectate", "socket"],

  methods: {
    matchSpectate() {
      this.socket.volatile.emit('isPlaying', { id: this.userToSpectate, notify: true }, (isPlayerInGame: boolean) => {
        if (isPlayerInGame) {
          this.socket.emit("spectate", this.userToSpectate);
          this.$router.push('/spectate');
        }
      });
    }
  }
})
</script>
