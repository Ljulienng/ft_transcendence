<template>
  <div>
    <notifications group="game" position="bottom right" :max="3" width="50%" :speed="300" :duration="-1">
      <template #body="{ item }">
        <div class="custom-template">
          <div class="custom-template-icon">
            <i class="icon ion-android-checkmark-circle" />
          </div>
          <div class="custom-template-content">
            <div class="custom-template-title">
              {{ item.title }}
            </div>
            <div
              class="custom-template-text"
              v-html="item.text"
            />
          </div>
          <button
            type="button"
            class="btn-primary"
            @click="acceptGame(item.data.id, item.id)"
          >
            <span class="material-icons px-1">done</span>
         
          </button>
          <button
            type="button"
            class="btn-primary"
            @click="refuseGame(item.data.id, item.id)"
          >
            <span class="material-icons px-1">close</span>
         
          </button>
        </div>
      </template>
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
        id: this.id++,
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

    refuseGame(userId: number, id: number) {
      this.socket.emit("matchRefused", userId)
      this.$notify.close(id);
    },

    acceptGame(userId: number, id: number) {
      this.socket.emit("matchAccepted", userId)
      this.$notify.close(id);
    }
  },

  // mounted() {

  // },

  created() {
      this.socket.on("moveToMatch", () => {
        this.$router.push("/play");
      });  
    this.socket.on('matchRefused/' + this.currentUser.id, () => {console.log('REFUSED')})

    // eslint-disable-next-line
    this.socket.on("matchInvitation/" + this.currentUser.id, (data: any) => {
      this.show("game", data.username + " invited you to a game !", data, "GAME");
    });
  
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

    this.socket.on("/joinChannelError/", (data: string) => {
      this.show("channel", data, data, "CHANNEL", 'warn');
    });

    this.socket.on("/createChannelError/", (data: string) => {
      this.show("channel", data, data, "CHANNEL", 'warn');
    });

    this.socket.on("/passwordError/", (data: string) => {
      this.show("channel", data, data, "CHANNEL", 'warn');
    });

    this.socket.on("/passwordChanged/", (data: string) => {
      this.show("channel", data, data, "CHANNEL", 'success');
    });

    this.socket.on("/changeChannelNameError/", (data: string) => {
      this.show("channel", data, data, "CHANNEL", 'warn');
    });

  }
});
</script>

<style lang="scss">
.custom-template {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  text-align: left;
  font-size: 13px;
  margin: 5px;
  margin-bottom: 0;
  align-items: center;
  justify-content: center;
  &, & > div {
    box-sizing: border-box;
  }
  background: #fff774;
  opacity: 1;
  // border: 2px solid #D0F2E1;
  .custom-template-icon {
    flex: 0 1 auto;
    color: #15C371;
    font-size: 32px;
    padding: 0 10px;
  }
  .custom-template-close {
    flex: 0 1 auto;
    padding: 0 20px;
    font-size: 16px;
    opacity: 0.2;
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
  .custom-template-content {
    padding: 10px;
    flex: 1 0 auto;
    .custom-template-title {
      letter-spacing: 1px;
      text-transform: uppercase;
      font-size: 10px;
      font-weight: 600;
    }
  }
}
</style>