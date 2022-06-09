<template>
  <div class="channelBox">
    <div v-if="channelMember.owner == true">
      <div>
        <button @click="deleteChannel()">Delete channel </button>
      </div>
      <div>
        <button @click="changeChannelName()">Change channel name : </button>
        <input type="text" maxlength="50" v-model="newChannelName" placeholder="new channel name"/>
      </div>
      <div>
        <button @click="setMemberAsAdmin()">Set member as admin : </button>
        <input type="text" maxlength="100" v-model="upgradeMember.username" class="inputMessage" placeholder="username"/>
      </div>
      <div v-if="channelType == 'protected'"> <!-- change password only by owner -->
        <button @click="changePassword()">Change password : </button>
        <input type="password" maxlength="100" v-model="passwordI.old" class="inputMessage" placeholder="old password"/>
        <input type="password" maxlength="100" v-model="passwordI.new" class="inputMessage" placeholder="new password" />
      </div>
    <div v-if="channelMember.admin == true">
      <div v-if="channelType == 'private'"> <!-- invitations only by admins -->
        <button  @click="invite()">Invite : </button>
        <input type="text" maxlength="30" v-model="invitation.guest" class="inputMessage" placeholder="username"/>
      </div>
      <div>
        <button  @click="mute()">Mute : </button>
        <input type="text" maxlength="30" v-model="muteUser" class="inputMessage" placeholder="username"/>
      </div>
      <div>
        <button  @click="ban()">Ban : </button>
        <input type="text" maxlength="30" v-model="banUser" class="inputMessage" placeholder="username"/>
      </div>
    </div>
    </div>
    <p>{{ channel }}</p>
    <div class="messageList">
      <p v-for="msg in messageList.slice().reverse()" :key="msg">
        {{ msg.user.username }}: {{ msg.content }}
      </p>
    </div>
    <div>
      <button @click="sendMessage">Send message</button>
      <input type="text" maxlength="100" v-model="message.content" class="inputMessage"/>
    </div>
    <br />
  </div>
</template>

<script lang="ts">
import MessageI from "../../types/interfaces/message.interface";
import ChannelMemberI from "../../types/interfaces/channelMember.interface";
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
      channelMember: {} as ChannelMemberI,
      newChannelName: "",
      muteUser: "",
      banUser: "",
      upgradeMember: {
        channelId: this.channel,
        username: "",
      },
      invitation: {
        channelId: this.channel,
        guest: "",
      },
      passwordI : {
        old: "",
        new: "",
        channelId: this.channel,
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

    changePassword() {
      this.socket.emit("changePassword", this.passwordI);
      this.passwordI.old = "";
      this.passwordI.new = "";
    },

    setMemberAsAdmin() {
      this.socket.emit("upgradeMember", this.upgradeMember);
      this.upgradeMember.username = "";
    },

    deleteChannel() {
      console.log("delete channel");
      this.socket.emit("deleteChannel", this.channel);
    },

    changeChannelName() {
      const changeChannelName = {
        channelId: this.channel,
        name: this.newChannelName,
      };
      this.socket.emit("changeChannelName", changeChannelName);
      this.newChannelName = "";
    },

    ban() {
      const ban = {
        channelId: this.channel,
        username: this.banUser,
      };
      this.socket.emit("ban", ban);
      this.banUser = "";
    },

    mute() {
      const mute = {
        channelId: this.channel,
        username: this.muteUser,
      };
      this.socket.emit("mute", mute);
      this.muteUser = "";
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
      "passwordChanged", (data: string) => { console.log("passwordChanged:", data);}
    );

    this.socket.on(
      "channelMemberInfo", (data: ChannelMemberI) => {
          this.channelMember = data;
        }
    );
},

  // unmounted() {
  // 	this.test.close;
  // },

  created() {
    console.log("socket = ", this.socket);
    // console.log("Channelbox created");
    this.getMessages();
    // this.socket.emit("isOwner", this.channel);
    // this.socket.emit("isAdmin", this.channel);
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
