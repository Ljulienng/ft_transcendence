<template>
  <div>
    <template v-if="context === 'mute'">
    <button
      type="button"
      class="btn btn-secondary"
      @click="createModal"
      v-if="!member.admin && !member.muted"
    >
      mute
    </button>

    <button
      @click="unmute"
      class="btn-secondary"
      v-if="!member.admin && member.muted"
    >
      Unmute
    </button>
    <form v-on:submit.prevent="mute">
    <div
      class="modal fade"
      id="mutemodal"
      ref="mutemodal"
      tabindex="-1"
      aria-labelledby="mutemodal"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="mutemodal">Mute timer</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <label for="timeToMute">Time</label>
            <br />
            <input
              id="timeToMute"
              v-model="timeToMute"
              type="number"
              timeToMute="timeToMute"
            />
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
            <!-- <button type="button" class="btn btn-primary">Save changes</button> -->
            <button
              class="btn btn-primary"
              value="submit"
              type="submit"
              data-bs-dismiss="modal"
            >
              Mute
            </button>
          </div>
        </div>
      </div>
    </div>
    </form>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { Modal } from "bootstrap";

export default defineComponent({
  /* eslint-disable */

  props: ["context", "member", "socket", "channelId"],

  data() {
    return {
      timeToMute: 0,
      timeToBan: 0,
      modal: null as any,
    };
  },

  methods: {
    ban() {
      console.log("test to mute for 1 minutes");
      const timeToBan = this.timeToBan; // TEST
      const update = {
        channelId: this.channelId,
        username: this.member.user.username,
        banned: true,
        timeToBan: timeToBan == undefined ? null : timeToBan,
      };
      this.socket.emit("muteban", update);
    },

    unban(username: string) {
      const update = {
        channelId: this.channelId,
        username: this.member.user.username,
        banned: false,
      };
      this.socket.emit("muteban", update);
    },

    mute() {
      console.log("test to mute for", this.timeToMute, "minutes");
      const timeToMute = this.timeToMute; // TEST
      const update = {
        channelId: this.channelId,
        username: this.member.user.username,
        muted: true,
        timeToMute: timeToMute == undefined ? null : timeToMute,
      };
      this.socket.emit("muteban", update);
    },

    unmute() {
      const update = {
        channelId: this.channelId,
        username: this.member.user.username,
        muted: false,
      };
      this.socket.emit("muteban", update);
    },

    createModal() {
      this.modal = new Modal(this.$refs.mutemodal as any);
      this.modal.show();
    },

    closeModal() {
      this.modal.close()
    }
  },

  //   created() {
  //     this.createModal();
  //     // console.log("member = ", this.member);
  //   },
});
</script>
