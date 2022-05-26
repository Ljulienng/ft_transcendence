<template>
  <div class="chatBox">
    <p>{{ channel }}</p>
    <div class="messageList">
      <p v-for="msg in messageList" :key="msg">
        {{ msg.sender.username }}: {{ msg.content }}
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
import MessageUserI from "../types/interfaces/message.interface";
// import http from "../http-common";
import { defineComponent } from "@vue/runtime-core";
import store from "../store";

export default defineComponent({
  props: {
    receiverId: {
      type: Number,
      default: 0
    },
  },

  data() {
    return {
      // test: io('http://localhost:3000/channel', {  withCredentials: true}),
      currentUser: store.getters["auth/getUserProfile"],
      message: {
        senderId: 0,
        sender: "",
        receiverId: 0,
        content: "",
      },
      socket: store.getters["auth/getUserSocket"],
      messageList: [] as MessageUserI[],
      messageList2: [] as MessageUserI[],
    };
  },

  methods: {
    sendMessage() {
      this.message.senderId = this.currentUser.id;
      this.message.sender = this.currentUser.username
      this.message.receiverId = this.receiverId;
      console.log(
        "sendMessage - on User ",
        this.message.receiverId,
        this.message.content
      );
      this.socket.emit("sendMessageToUser", this.message);
      // this.socket.emit('sendMessageToServer', this.message);
      // this.getMessageList();
    },

    async getMessages() {
      console.log("heho", this.receiverId);
      this.socket.emit("getUserMsg", this.receiverId);
      this.socket.on("getUserMessages" + this.receiverId, (data: MessageUserI[]) => {
        this.messageList = data;
      });
    },
  },

  mounted() {
    if (this.socket === undefined) {
      this.socket = store.getters["auth/getUserSocket"];
    }
    this.socket.on("messageSentFromUser", () => {
        console.log("euh i ", this.receiverId)
      this.socket.emit("getUserMsg", this.receiverId);
      // console.log("data");
    });
    this.socket.on(
      "getUserMessages" + this.receiverId,
      (data: MessageUserI[]) => {
        this.messageList = data;
      }
    );
  },

  // unmounted() {
  // 	this.test.close;
  // },

  created() {
    console.log("socket = ", this.socket, "other user id = ", this.receiverId);

    console.log("chatbox created");
    this.getMessages();
  },
  // setup() {
  // },
});
</script>

<style lang="scss">
.chatBox {
  float: right;
}
</style>
