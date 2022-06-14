<template>
  <div>
    <!--=========================== ADMIN SETTINGS ===========================-->

    <div v-if="channelMember.admin">
      <div>
        <button
          @click="deleteChannel()"
          class="btn-danger"
          v-if="channelMember.owner"
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
          <button @click="changePassword()" class="btn-primary">
            Change password :
          </button>
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
        <div v-if="channelMember.admin && channelType == 'private'">
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
        <template v-if="channelMember.owner">
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
        <template v-if="channelMember.admin">
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
            v-if="member.admin && !member.owner && channelMember.owner"
          >
            Kick
          </button>
        </template>
        <template v-if="channelMember.admin">
          <BanMuteModal
            v-bind:context="'mute'"
            v-bind:member="member"
            v-bind:socket="socket"
            v-bind:channelId="channelId"
          />
          <!-- 
          <button
            @click="ban(member.user.username)"
            class="btn-secondary"
            v-if="!member.admin && !member.banned"
          >
            Ban
          </button>
          <button
            @click="unban(member.user.username)"
            class="btn-secondary"
            v-if="!member.admin && member.banned"
          >
            Unban
          </button> -->
        </template>
        <template v-if="member.admin">(admin)</template>
        <template v-if="member.muted">(muted)</template>
        <template v-if="member.banned">(banned)</template>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent } from "@vue/runtime-core";
import { Socket } from "socket.io-client";
import http from "../../http-common";
import VueCrontab from "vue-crontab";
import BanMuteModal from "./BanMuteModal.vue";

export default defineComponent({
  components: {
    BanMuteModal,
  },

  props: {
    currentUser: {
      type: Object,
      required: true,
    },
    channelId: {
      type: Number,
      required: true,
    },
    channelType: String,
    socket: {
      type: Socket,
      required: true,
    },
    channelMember: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      muteBanCounter: 0,
      memberList: [],
      newChannelName: "",
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

  computed: {},

  watch: {},

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

    ban(username: string, timeToBan: number) {
      console.log("test to mute for 1 minutes");
      timeToBan = 1; // TEST
      const update = {
        channelId: this.channelId,
        username: username,
        banned: true,
        timeToBan: timeToBan == undefined ? null : timeToBan,
      };
      this.socket.emit("muteban", update);
    },

    unban(username: string) {
      const update = {
        channelId: this.channelId,
        username: username,
        banned: false,
      };
      this.socket.emit("muteban", update);
    },

    mute(username: string, timeToMute: number) {
      console.log("test to mute for 1 minutes");
      timeToMute = 1; // TEST
      const update = {
        channelId: this.channelId,
        username: username,
        muted: true,
        timeToMute: timeToMute == undefined ? null : timeToMute,
      };
      this.socket.emit("muteban", update);
    },

    unmute(username: string) {
      const update = {
        channelId: this.channelId,
        username: username,
        muted: false,
      };
      this.socket.emit("muteban", update);
    },
  },

  mounted() {
    this.socket.on("passwordChanged", (data: string) => {
      console.log("passwordChanged:", data);
    });
    this.socket.on("/adminPromoted/" + this.channelId, () => {
      this.getChannelMembers();
    });
    this.socket.on("/adminUnpromoted/" + this.channelId, () => {
      this.getChannelMembers();
    });
    this.socket.on("/memberKicked/channel/" + this.channelId, () => {
      this.getChannelMembers();
    });
    this.socket.on("/userJoined/channel/" + this.channelId, () => {
      console.log("user Joined");
      this.getChannelMembers();
    });
    this.socket.on("/userLeft/channel/" + this.channelId, () => {
      console.log("user Left");
      this.getChannelMembers();
    });
    this.socket.on("/userKicked/" + this.currentUser.userName, () => {
      this.$emit("close");
    });

    this.socket.on("/userUpdated/channel/" + this.channelId, () => {
      console.log("user muted or banned");
      this.getChannelMembers();
    });

    this.socket.on("/userUpdated/channel/", () => {
      console.log("user unmuted or unbanned");
      this.getChannelMembers();
    });
  },

  created() {
    this.getChannelMembers();
  },
});
</script>
