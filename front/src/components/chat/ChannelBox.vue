<template>

  <div class="channelBox h-100">

    <div v-if="channelMember.banned">
      You can't access the channel [banned] ... but you can beg admins if you want to go back ...
    </div>

    <div class="h-100" v-if="!channelMember.banned">

      <!-- <div v-if="channelMember.owner" class="boxhead" style="height: 10%;"> -->
      <div class="container-fluid boxhead" style="height: 10%;">
        <ChannelSettings
          v-bind:currentUser="currentUser"
          v-bind:channelId="channel"
          v-bind:channelType="channelType"
          v-bind:socket="socketChannel"
          v-bind:channelMember="channelMember"
          @close="$emit('close')"
        />
      </div>

      <div class="container-fluid" style="height: 80%; overflow-y: scroll; overflow-x: hidden;">
        <p v-for="msg in messageList.slice()" :key="msg">
          <!-- {{ msg.sender.username }}: {{ msg.content }} -->
          <Message
            :sender="msg.user.username"
            :content="msg.content"
            :currentUser="currentUser.userName"
          />
        </p>
      </div>

      <div v-if="!channelMember.muted" class="row align-items-center justify-content-between mx-2" style="height: 10%;">
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
      <!-- <div v-if="!channelMember.muted">
        <button @click="sendMessage" class="btn-primary">Send message</button>
        <input
          type="text"
          maxlength="100"
          v-model="message.content"
          class="inputMessage"
        /> -->
      </div>

    </div>

    <br />
  </div>

</template>

<script lang="ts">
import MessageI from "../../types/interfaces/message.interface";
import { Socket } from "socket.io-client";
// import http from "../http-common";
import ChannelSettings from "./ChannelSettings.vue";
import { defineComponent } from "@vue/runtime-core";
import store from "../../store";
import Message from "./Message.vue"

export default defineComponent({
  components: {
    ChannelSettings,
    Message,
  },

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
    /* eslint-disable */
    return {
      // test: io('http://localhost:3000/channel', {  withCredentials: true}),
      currentUser: store.getters["auth/getUserProfile"],
      channelMember: {} as any,
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
    },

    async getMessages() {
      this.socket.emit("getChannelMsg", this.channel);
      this.socket.on("getChannelMessages", (data: MessageI[]) => {
        this.messageList = data;
      });
    },
  },

  mounted() {
    this.socket.on("messageUpdate/" + this.channel, () => {
      console.log("messageUpdate");
      this.socket.emit("getChannelMsg", this.channel);
    });

    this.socket.on(
      "getChannelMessages" + this.currentUser.id,
      (data: MessageI[]) => {
        // console.log("getChannelMessages");
        this.messageList = data;
      }
    );

    this.socket.on(
      "channelMemberInfo", (data: any) => {
          // console.log("update channelMemberInfo : ", this.channelMember)
          this.channelMember = data;
        }
    );

    this.socket.on(
      "channelMembersInfo", () => {
        this.socket.emit("getChannelMemberInfo", this.channel);
      }
    );

  },

  // unmounted() {
  // 	this.test.close;
  // },

  created() {
    this.getMessages();
    this.socket.emit("getChannelMemberInfo", this.channel);
  },
  // setup() {
  // },
});
</script>

<style lang="scss">
// .channelBox {
//   float: right;
// }
</style>
