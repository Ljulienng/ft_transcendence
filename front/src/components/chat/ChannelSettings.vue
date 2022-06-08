<template>
  <div>
    <!--=========================== ADMIN SETTINGS ===========================-->

    <div v-if="isAdmin === true">
      <div>
        <button
          @click="deleteChannel()"
          class="btn-danger"
          v-if="isOwner === true"
        >
          Delete channel
        </button>
        <div>
          <button @click="changeChannelName()" class="btn-primary">
            Change channel name :
          </button>
          <input
            type="text"
            maxlength="50"
            v-model="newChannelName"
            placeholder="new channel name"
          />
        </div>
        <div v-if="channelType == 'protected'">
          <!-- change password only by owner -->
          <button @click="changePassword()">Change password :</button>
          <input
            type="password"
            maxlength="100"
            v-model="passwordI.old"
            class="inputMessage"
            placeholder="old password"
          />
          <input
            type="password"
            maxlength="100"
            v-model="passwordI.new"
            class="inputMessage"
            placeholder="new password"
          />
        </div>
        <div v-if="isAdmin == true && channelType == 'private'">
          <!-- invitations only by admins -->
          <button @click="invite()">Invite :</button>
          <input
            type="text"
            maxlength="30"
            v-model="invitation.guest"
            class="inputMessage"
            placeholder="username"
          />
        </div>
      </div>
    </div>

    <!--=========================== USER LIST ===========================-->

    <ul>
      <li v-for="member in memberList" :key="member">
        <!-- <div>{{ member.user.username }}</div> -->
        <template v-if="member.owner">OWNER = </template>
        {{ member.user.username }}
        <template v-if="isOwner">
          <button
            @click="setMemberAsAdmin(member.user.username)"
            class="btn-primary"
            v-if="member.admin === false"
          >
            PROMOTE
          </button>
          <button
            @click="unsetMemberAsAdmin(member.user.username)"
            class="btn-primary"
            v-if="member.admin === true && !member.owner"
          >
            DEMOTE
          </button>
        </template>
        <template v-if="isAdmin">
          <button
            @click="kickMember(member.user.username)"
            class="btn-danger"
            v-if="member.admin === false"
          >
            Kick
          </button>
          <button
            @click="kickMember(member.user.username)"
            class="btn-danger"
            v-if="member.admin && !member.owner && isOwner"
          >
            Kick
          </button>
        </template>
        <template v-if="member.admin">(admin)</template>
        <template v-if="member.muted">(muted)</template>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { Socket } from "socket.io-client";
import http from "../../http-common";

export default defineComponent({
  props: {
    currentUser: Object,
    channelId: Number,
    channelType: String,
    socket: Socket,
  },

  data() {
    return {
      memberList: [],
      isAdmin: false,
      isOwner: false,
      newChannelName: "",
      // upgradeMember: {
      //   channelId: this.channelId,
      //   username: "",
      // },
      invitation: {
        channelId: this.channelId,
        guest: "",
      },
      passwordI: {
        old: "",
        new: "",
        channelId: this.channelId,
      },
    };
  },

  methods: {
    async getChannelMembers() {
      this.memberList = await http
        .get("/channel/" + this.channelId + "/members")
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    async checkIfAdmin() {
      const user = this.memberList.find(
        (member) => this.currentUser.userName === member.user.username
      );
      if (user.admin) this.isAdmin = true;
      if (user.owner) this.isOwner = true;
      console.log("memberList = ", this.memberList, this.isAdmin, this.isOwner);
    },

    deleteChannel() {
      this.socket.emit("deleteChannel", this.channelId);
    },

    changeChannelName() {
      const changeChannelName = {
        channelId: this.channelId,
        name: this.newChannelName,
      };
      this.socket.emit("changeChannelName", changeChannelName);
      this.newChannelName = "";
    },

    setMemberAsAdmin(username: string) {
      const upgradeMember = {
        channelId: this.channelId,
        username: username,
      };
      this.socket.emit("upgradeMember", upgradeMember);
    },

    unsetMemberAsAdmin(username: string) {
      const downgradeMember = {
        channelId: this.channelId,
        username: username,
      };
      this.socket.emit("downgradeMember", downgradeMember);
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

    kickMember(username: string) {
      const userToKick = {
        channelId: this.channelId,
        username: username,
      };
      this.socket.emit("kickMember", userToKick);
    },
  },

  mounted() {
    this.socket.on("passwordChanged", (data: string) => {
      console.log("passwordChanged:", data);
    });
    this.socket.on("/adminPromoted/" + this.channelId, () => {
      this.getChannelMembers().then(() => {
        this.checkIfAdmin();
      });
    });
    this.socket.on("/adminUnpromoted/" + this.channelId, () => {
      this.getChannelMembers();
      if (!this.isOwner) this.isAdmin = false;
    });
    this.socket.on("/memberKicked/channel/" + this.channelId, () => {
      this.getChannelMembers();
    });
    this.socket.on("/userJoined/channel/" + this.channelId, () => {
      console.log("user Joined");
      this.getChannelMembers();
    });
    this.socket.on("/userKicked/" + this.currentUser.userName, () => {
      this.$emit("close");
    });
  },

  created() {
    this.getChannelMembers().then(() => {
      this.checkIfAdmin();
    });
    // console.log("data = ", this.memberList());
    // this.checkIfAdmin();
  },
});
</script>
