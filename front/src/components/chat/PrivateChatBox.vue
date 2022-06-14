<template>
  <div class="chatBox h-100">

    <div class="container-fluid" style="height: 90%; overflow-y: scroll;">
      <p v-for="msg in messageList.slice()" :key="msg">
        <!-- {{ msg.sender.username }}: {{ msg.content }} -->
        <Message
          :sender="msg.sender.username"
          :content="msg.content"
          :currentUser="currentUser.userName"
        />
      </p>
    </div>

    <div class="row align-items-center justify-content-between mx-2" style="height: 10%;">
      <div class="col">
        <input
          type="text"
          maxlength="100"
          v-model="message.content"
          class="form-control"
          placeholder="say something (interesting)..." 
        />
        <p v-if="errorMsg !== ''" style="color: red">{{ errorMsg }}</p>
      </div>
      <div class="col-auto">
        <button @click="sendMessage">
          <i style="color: #fff774" class="material-icons">send</i>
        </button>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import MessageUserI from "../../types/interfaces/message.interface";
// import http from "../http-common";
import { defineComponent } from "@vue/runtime-core";
import store from "../../store";
import Message from "./Message.vue"

export default defineComponent({
  props: {
    receiverId: {
      type: Number,
      default: 0,
    },
  },

  components: {
      Message,
  },

  data() {
    return {
      currentUser: store.getters["auth/getUserProfile"],
      message: {
        senderId: 0,
        sender: "",
        receiverId: 0,
        content: "",
      },
      errorMsg: "",
      socket: store.getters["auth/getUserSocket"],
      messageList: [] as MessageUserI[],
      messageList2: [] as MessageUserI[],
    };
  },

  methods: {
    sendMessage() {
      this.message.senderId = this.currentUser.id;
      this.message.sender = this.currentUser.username;
      this.message.receiverId = this.receiverId;

      this.socket.emit("sendMessageToUser", this.message);
      console.log("sendMessage:", this.message);
    },

    async getMessages() {
      console.log("heho", this.receiverId);
      this.socket.emit("getUserMsg", this.receiverId);
      this.socket.on(
        "getUserMessages" + this.receiverId,
        (data: MessageUserI[]) => {
          this.messageList = data;
        }
      );
    },
  },

  mounted() {
    if (this.socket === undefined) {
      this.socket = store.getters["auth/getUserSocket"];
    }
    this.socket.on("chatBlocked", () => {
      this.errorMsg = "Either you or him have been blocked";
    });
    this.socket.on("messageSent", () => {
      this.socket.emit("getUserMsg", this.receiverId);
    });
    this.socket.on("messageSentFromUser" + this.receiverId, () => {
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

  created() {
    console.log("chatbox created");
    this.getMessages();
  },
  // setup() {
  // },
});
</script>

<!-- <style lang="scss">
.messageList {
  height: 200px; /* or any height you want */
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
}

.chatBox {
  float: right;
}
</style> -->
