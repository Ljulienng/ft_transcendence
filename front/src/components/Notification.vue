<template>
  <div>
    <notifications group="test">
      <!-- <template #body="{ item }">

      </template> -->
    </notifications>
    <notifications
      group="auth"
      position="top center"
      :max="1"
      :speed="300"
      width="50%"
    />
    <notifications
      group="channel"
      position="top center"
      :max="3"
      :speed="300"
      width="50%"
    />
    <notifications
      group="friend"
      position="top center"
      :max="3"
      :speed="300"
      width="50%"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import store from "../store";
// import Notifications from "@kyvg/vue3-notification"

export default defineComponent({
  props: ["currentUser"],
  data() {
    return {
      socket: store.getters["auth/getUserSocket"],
      id: 0,
      animation: {
        enter: {
          opacity: [1, 0],
          translateX: [0, -300],
          scale: [1, 0.2],
        },
        leave: {
          opacity: 0,
          height: 0,
        },
      },
    };
  },
  methods: {
    show(group: string, text: string, data = null as any, title = "", type = "") {
      console.log(group, text, data, title, type)
      this.$notify({
        group,
        title,
        text,
        type,
        data
      });
    },

    clean(group: string) {
      this.$notify({ group, clean: true });
    },
  },

  // mounted() {

  // },

  created() {
    this.socket.on("Connected", () => {
      this.show("auth", "Logged in !", null, "Authenticated", 'success');
    });

    this.socket.on("/userKicked/" + this.currentUser.userName, (data: string) => {
      this.show("channel", "You've been kicked from the channel " + data, data, "CHANNEL", 'warn');
    });

    this.socket.on("/friendAdded/" + this.currentUser.userName, (data: string) => {
      this.show("friend", data + " added you to his friendlist !", data, "FRIENDS", 'success');
    });

    this.socket.on("/friendDeleted/" + this.currentUser.userName, (data: string) => {
      this.show("friend", data + " deleted you from his friendlist..", data, "FRIENDS", 'warn');
    });

    this.socket.on("/userJoined/" + this.currentUser.userName, (data: string) => {
      this.show("channel", "You've joined the channel " + data, data, "CHANNEL", 'success');
    });

    this.socket.on("/userLeft/" + this.currentUser.userName, (data: string) => {
      this.show("channel", "You've left the channel " + data, data, "CHANNEL", 'success');
    });

    this.socket.on("/invitationChannel/" + this.currentUser.userName, (data: string) => {
      this.show("channel", "You've been added to the private channel " + data, data, "CHANNEL", 'success');
    });

    this.socket.on("/muteorban/" + this.currentUser.userName, (data: string) => {
      this.show("channel", "The administrators have changed your status in the channel " + data, data, "CHANNEL", 'warn');
    });

    this.socket.on("/muteorban/" + this.currentUser.userName, (data: string) => {
      this.show("channel", "The administrators have changed your status in the channel " + data, data, "CHANNEL", 'warn');
    });
  }
});
</script>
