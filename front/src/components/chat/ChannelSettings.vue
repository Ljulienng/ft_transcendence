<template>
  <div>
    <!--=========================== ADMIN SETTINGS ===========================-->

    <div v-if="channelMember.admin">
      <div>
        
        <!-- CHANGE NAME -->
        <a type="button" data-bs-toggle="modal" data-bs-target="#channameModal" class="primary text-decoration-none display-5">
          name <i style="color: #fff774" class="material-icons">border_color</i>
        </a>

        <form v-on:submit.prevent="changeChannelName">
          <div class="modal fade" id="channameModal" tabindex="-1" aria-labelledby="channameModal" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="channameModal">Change channel name</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                  <div class="modal-body">
                      <input
                        id="name"
                        class="form-control"
                        v-model="newChannelName"
                        type="text"
                        name="name"
                        placeholder="new channel name"
                      />
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Change</button>
                  </div>
              </div>
            </div>
          </div>
        </form>

        <!-- DELETE -->
        <button @click="deleteChannel()">
          <span class="material-icons px-1" style="color: red">delete</span>
        </button>

        <!-- CHANGE PASSWORD -->
        <a v-if="channelType == 'protected'" type="button" data-bs-toggle="modal" data-bs-target="#chanpwdModal" class="primary text-decoration-none display-5">
          <i style="color: #fff774" class="material-icons">key</i>
        </a>

        <form v-if="channelType == 'protected'" v-on:submit.prevent="changePassword">
          <div class="modal fade" id="chanpwdModal" tabindex="-1" aria-labelledby="chanpwdModal" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="chanpwdModal">Change password</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                  <div class="modal-body">
                      <input
                        id="name"
                        class="form-control"
                        maxlength="100"
                        v-model="passwordI.old"
                        type="password"
                        name="name"
                        placeholder="old password"
                      />
                      <!-- !!!! Check that old password is ok -->
                      <input
                        id="name"
                        class="form-control"
                        maxlength="100"
                        v-model="passwordI.new"
                        type="password"
                        name="name"
                        placeholder="new password"
                      />
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Change</button>
                  </div>
              </div>
            </div>
          </div>
        </form>

        <!-- INVITE -->
        <a v-if="channelMember.admin && channelType == 'private'" type="button" data-bs-toggle="modal" data-bs-target="#inviteModal" class="primary text-decoration-none display-5">
          <i style="color: #fff774" class="material-icons">person_add</i>
        </a>

        <form v-if="channelMember.admin && channelType == 'private'" v-on:submit.prevent="invite">
          <div class="modal fade" id="inviteModal" tabindex="-1" aria-labelledby="inviteModal" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="inviteModal">Invite</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                  <div class="modal-body">
                      <input
                        id="name"
                        class="form-control"
                        maxlength="50"
                        v-model="invitation.guest"
                        type="text"
                        name="name"
                        placeholder="username"
                      />
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Add</button>
                  </div>
              </div>
            </div>
          </div>
        </form>

      </div>
    </div>


    <!-- USERS -->
    <a type="button" data-bs-toggle="modal" data-bs-target="#users" class="primary text-decoration-none display-5">
      <i style="color: #fff774" class="material-icons">group</i>
    </a>

    <form v-if="channelMember.admin && channelType == 'private'" v-on:submit.prevent="invite">
      <div class="modal fade" id="users" tabindex="-1" aria-labelledby="users" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="users">Channel members</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
              <div class="modal-body">
                  <ul>
                    <li v-for="member in memberList" :key="member">
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
                          <button
                            @click="mute(member.user.username)"
                            class="btn-secondary"
                            v-if="!member.admin && !member.muted"
                          >
                            Mute
                          </button>
                          <button
                            @click="unmute(member.user.username)"
                            class="btn-secondary"
                            v-if="!member.admin && member.muted"
                          >
                            Unmute
                          </button>
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
                          </button>
                        </template>
                        <template v-if="member.admin">(admin)</template>
                        <template v-if="member.muted">(muted)</template>
                        <template v-if="member.banned">(banned)</template>
                    </li>
                  </ul>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
          </div>
        </div>
      </div>
    </form>
    
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent } from "@vue/runtime-core";
import { Socket } from "socket.io-client";
import http from "../../http-common";
import VueCrontab from 'vue-crontab'

export default defineComponent({
  props: {
    currentUser: {
      type: Object,
      required: true
    },
    channelId: {
      type: Number,
      required: true
    },
    channelType: String,
    socket: {
      type: Socket,
      required: true
    },
    channelMember: {
      type: Object,
      required: true
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

  computed: {
  
  },

  watch: {
    
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
