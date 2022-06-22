<template>
  <div class="col px-0">
    <button class="btn p-0 m-0" data-bs-toggle="modal" data-bs-target="#newOptionsModal">
      <span class="material-icons px-0" style="color: white">sports_esports</span>
    </button>
    <div class="modal fade" id="newOptionsModal" tabindex="-1" aria-labelledby="newOptionsLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header" style="background-color: #1c1d21; border-bottom: 1px solid #fff774;">
            <h5 class="modal-title welcome mt-0" id="newOptionsLabel">Game Options</h5>
          </div> <!-- modal-header -->
          <Options v-on:invitation="matchInvitation" style="background-color: #1c1d21;"></Options>
        </div> <!-- modal-body -->
      </div> <!-- modal-content -->
    </div> <!-- modal-dialog -->
  </div> <!-- newChatModal -->
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import Options from "./Options.vue";
/* eslint-disable */

export default defineComponent({
  name: "OptionsModal",
  components: { Options },
  props: ["userToInvite", "socket"],
  methods: {
    matchInvitation(options: any) { // TODO: on submit
      this.socket.emit("matchInvitation", [this.userToInvite, options]);
    },
  },
  beforeMount() {  // TODO: do earlier ?
    // if player is in game, redirect it to its game
    this.socket.volatile.emit('amIInGame', (amIInGame: boolean) => {
      if (amIInGame == true) {
        this.socket.volatile.emit('playerReconnect');
        this.$router.push('/play');
      }
    });
    setTimeout(() => {
      this.socket.volatile.emit('amIInGame', (amIInGame: boolean) => {
        if (amIInGame == true) {
          this.socket.volatile.emit('playerReconnect');
          this.$router.push('/play');
        }
      });
    }, 100);
  }
});
</script>

<style src="../../assets/css/home.css" scoped>
</style>
