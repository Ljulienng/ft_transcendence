<template>
  <div class="channelBox">
    <div v-if="isAdmin == true"> <!-- invitations only by admins -->
      <button v-if="channelType == 'private'" @click="invite()">Invite : </button>
      <input
          type="text"
          maxlength="30"
          v-model="invitation.guest"
          class="inputMessage"
          placeholder="username"
        />
    </div>
    <p>{{ channel }}</p>
    <div class="messageList">
      <p v-for="msg in messageList.slice().reverse()" :key="msg">
        {{ msg.user.username }}: {{ msg.content }}
      </p>
    </div>
    <div>
      <button @click="sendMessage">Send message</button>
      <input
        type="text"
        maxlength="100"
        v-model="message.content"
        class="inputMessage"
      />
    </div>
    <br />
  </div>
</template>

<script lang="ts">
import MessageI from "../../types/interfaces/message.interface";
import { Socket } from "socket.io-client";
// import http from "../http-common";
import { defineComponent } from "@vue/runtime-core";
import store from "../../store";

export default defineComponent({
  props: {
    channel: {
      type: Number,
    },
    channelType: {
      type: String,
    },
    socketChannel: {
      type: Socket,
    },
  },

  data() {
    return {
      // test: io('http://localhost:3000/channel', {  withCredentials: true}),
      currentUser: store.getters["auth/getUserProfile"],
      isOwner: false,
      isAdmin: false,
      invitation: {
        channelId: this.channel,
        guest: "",
      },
      message: {
        userId: 0,
        username: "",
        content: "",
        channelId: this.channel,
      },
      socket: store.getters["auth/getUserSocket"],
      messageList: [] as MessageI[],
      messageList2: [] as MessageI[],
    };
  },

  methods: {
    sendMessage() {
      this.message.userId = this.currentUser.id;
      this.message.username = this.currentUser.username;
      console.log(
        "sendMessage - on channelId ",
        this.message.channelId,
        this.message.content
      );
      this.socket.emit("sendMessageToServer", this.message);
      // this.socket.emit('sendMessageToServer', this.message);
      // this.getMessageList();
    },

    async getMessages() {
      // console.log("heho");
      this.socket.emit("getChannelMsg", this.channel);
      this.socket.on("getChannelMessages", (data: MessageI[]) => {
        this.messageList = data;
      });
    },

    invite() {
      console.log("Invite/add friend to a private channel : ", this.invitation);
      this.socket.emit("inviteInPrivateChannel", this.invitation);
      this.invitation.guest = "";
    },

  },

  mounted() {
    if (this.socket === undefined) {
      this.socket = store.getters["auth/getUserSocket"];
    }
    this.socket.on("messageSent", () => {
      this.socket.emit("getChannelMsg", this.channel);
      // console.log("data");
    });
    this.socket.on(
      "getChannelMessages" + this.currentUser.id,
      (data: MessageI[]) => {
        this.messageList = data;
      }
    );
    this.socket.on(
      "isOwner", (data: boolean) => { this.isOwner = data; }
    );

    this.socket.on(
      "isAdmin", (data: boolean) => { this.isAdmin = data; console.log("Admin:", data);}
    );
},

  // unmounted() {
  // 	this.test.close;
  // },

  created() {
    console.log("socket = ", this.socket);
    // console.log("Channelbox created");
    this.getMessages();
    this.socket.emit("isOwner", this.channel);
    this.socket.emit("isAdmin", this.channel);
  },
  // setup() {
  // },
});
</script>

<style lang="scss">
.channelBox {
  float: right;
}
</style>
