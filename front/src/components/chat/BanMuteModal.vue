<template>
  <div>
    <template v-if="context === 'mute'">
      <button
        type="button"
        @click="createModal"
        v-if="!member.admin && !member.muted"
      >
        <span class="material-icons" style="color: grey">volume_off</span>
      </button>

      <button
        @click="unmute"
        v-if="!member.admin && member.muted"
      >
        <span class="material-icons" style="color: red">volume_off</span>
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
                <input
                  class="form-range"
                  id="timeToMute"
                  v-model="timeToMute"
                  type="range"
                  min="0"
                  max="60"
                  timeToMute="timeToMute"
                  onchange="rangeValue = timeToMute"
                />
                <div class="form-text">0 means until unmuted manually*</div>
                <div class="form-text">Mute for {{ timeToMute }} minutes*</div>
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

    <!-- ================ BAN TEMPLATE =================== -->

    <template v-else>
      <button
        type="button"
        @click="createModal"
        v-if="!member.admin && !member.banned"
      >
        <span class="material-icons" style="color: grey">block</span>
      </button>
      <button
        type="button"
        @click="unban"
        v-if="!member.admin && member.banned"
      >
        <span class="material-icons" style="color: red">block</span>
      </button>

      <form v-on:submit.prevent="ban">
        <div
          class="modal fade"
          id="banmodal"
          ref="banmodal"
          tabindex="-1"
          aria-labelledby="banmodal"
          aria-hidden="true"
        >
          <div class="modal-dialog modal-sm">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="banmodal">Ban timer</h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                <input
                  class="form-range"
                  id="timeToBan"
                  v-model="timeToBan"
                  type="range"
                  min="0"
                  max="60"
                  timeToBan="timeToBan"
                  onchange="rangeValue = timeToBan"
                />
                <div class="form-text">0 means until unbanned manually*</div>
                <div class="form-text">Ban for {{ timeToBan }} minutes*</div>
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
                  Ban
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
import { Socket } from "socket.io-client";

export default defineComponent({
  /* eslint-disable */

  // props: ["context", "member", "socket", "channelId"],

  props: {
    context: String,
    member: {
      type: Object,
      required: true,
    },
    socket: {
      type: Socket,
      required: true,
    },
    channelId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      update: 0,
      rangeValue: 0,
      timeToMute: 0,
      timeToBan: 0,
      modal: null as any,
    };
  },

  methods: {
    ban() {
      const update = {
        channelId: this.channelId,
        username: this.member.user.username,
        banned: true,
        timeToBan: this.timeToBan,
      };
      this.socket.emit("muteban", update);
    },

    unban() {
      const update = {
        channelId: this.channelId,
        username: this.member.user.username,
        banned: false,
      };
      this.socket.emit("muteban", update);
    },

    mute() {
      const update = {
        channelId: this.channelId,
        username: this.member.user.username,
        muted: true,
        timeToMute: this.timeToMute,
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
      if (this.context === "mute")
        this.modal = new Modal(this.$refs.mutemodal as any);
      else this.modal = new Modal(this.$refs.banmodal as any);

      this.modal.show();
    },

    closeModal() {
      this.modal.close();
    },
  },

  //   created() {
  //     this.createModal();
  //     // console.log("member = ", this.member);
  //   },
});
</script>
