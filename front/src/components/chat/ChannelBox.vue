<template>
  <div class="channelBox">
    <div v-if="channelMember.banned">
      You can't access to the channel [banned] ... but you can beg admins if you
      want to go back ...
    </div>
    <div v-if="!channelMember.banned">
      <ChannelSettings
        v-bind:currentUser="currentUser"
        v-bind:channelId="channel"
        v-bind:channelType="channelType"
        v-bind:socket="socketChannel"
        v-bind:channelMember="channelMember"
        @close="$emit('close')"
      />
      <div v-if="channelMember.owner"></div>
      <p>{{ channel }}</p>
      <div class="messageList">
        <p v-for="msg in messageList.slice().reverse()" :key="msg">
          {{ msg.user.username }}: {{ msg.content }}
        </p>
      </div>
      <div v-if="!channelMember.muted">
        <!-- a muted member can see messages but not send them -->
        <button @click="sendMessage" class="btn-primary">Send message</button>
        <input
          type="text"
          maxlength="100"
          v-model="message.content"
          class="inputMessage"
        />
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

export default defineComponent({
  components: {
    ChannelSettings,
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
        console.log("getChannelMessages");
        this.messageList = data;
      }
    );

    this.socket.on("channelMemberInfo", (data: any) => {
      console.log("update channelMemberInfo : ", this.channelMember);
      this.channelMember = data;
    });
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
.channelBox {
  float: right;
}
</style>
