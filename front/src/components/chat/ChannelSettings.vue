<template>
  <div class="input-group align-items-center justify-content-between">
    
    <h2>{{ name }}</h2>

    <div v-if="channelMember.admin">

        <!-- CHANGE NAME -->
        <button class="input-group-btn" type="button" data-bs-toggle="modal" data-bs-target="#channameModal">
          <i style="color: #fff774" class="material-icons">border_color</i>
        </button>

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
                        maxlength="20"
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

    </div>

    <div v-if="channelMember.owner">

        <!-- DELETE -->
        <button @click="deleteChannel()">
          <span class="material-icons px-1" style="color: red">delete</span>
        </button>

    </div>

    <div v-if="channelMember.owner">

        <!-- CHANGE PASSWORD -->
        <button v-if="type == 'protected'" type="button" data-bs-toggle="modal" data-bs-target="#chanpwdModal">
          <i style="color: #fff774" class="material-icons">key</i>
        </button>

        <form v-if="type == 'protected'" v-on:submit.prevent="changePassword">
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
                        maxlength="20"
                        v-model="passwordI.old"
                        type="password"
                        name="name"
                        placeholder="old password"
                      />
                      <input
                        id="name"
                        class="form-control"
                        maxlength="20"
                        v-model="passwordI.new"
                        type="password"
                        name="name"
                        placeholder="new password"
                      />
                      <!-- <button @click="removePasswordToProtectedChannel()" class="btn-primary">
                        Remove the password
                      </button> -->
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Change</button>
                  </div>
              </div>
            </div>
          </div>
        </form>

      </div>

      <div v-if="channelMember.owner && type == 'protected'">

        <!-- REMOVE PASSWORD -->
        <button @click="removePasswordToProtectedChannel()" type="button">
          <span class="material-icons px-1" style="color: red">key_off</span>
        </button>

      </div>

      <div v-if="channelMember.owner">

        <!-- ADD PASSWORD -->
        
        <button v-if="type == 'public'" type="button" data-bs-toggle="modal" data-bs-target="#addpwdModal">
          <i style="color: grey" class="material-icons">key</i>
        </button>

        <form v-if="type == 'public'" v-on:submit.prevent="addPasswordToPublicChannel">
          <div class="modal fade" id="addpwdModal" tabindex="-1" aria-labelledby="addpwdModal" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="addpwdModal">Add password</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                  <div class="modal-body">
                      <input
                        id="name"
                        class="form-control"
                        maxlength="20"
                        v-model="passwordI.new"
                        type="password"
                        name="name"
                        placeholder="password"
                      />
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Submit</button>
                  </div>
              </div>
            </div>
          </div>
        </form>

      </div>

      <div v-if="channelMember.admin">

        <!-- INVITE -->
        <button v-if="channelMember.admin && type == 'private'" type="button" data-bs-toggle="modal" data-bs-target="#inviteModal" class="primary text-decoration-none display-5">
          <i style="color: #fff774" class="material-icons">person_add</i>
        </button>

        <form v-if="channelMember.admin && type == 'private'" v-on:submit.prevent="invite">
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
                        maxlength="20"
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


    <!-- USERS -->
    <button type="button" data-bs-toggle="modal" data-bs-target="#usersModal" class="primary text-decoration-none display-5">
      <i style="color: #fff774" class="material-icons">group</i>
    </button>

    <!-- <form v-if="channelMember.admin && channelType == 'private'" v-on:submit.prevent="invite"> -->
      <div class="modal fade" id="usersModal" tabindex="-1" aria-labelledby="usersModal" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">

            <div class="modal-header">
              <h5 class="modal-title" id="usersModal">Channel members</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">
                <ul>
                  <li v-for="member in memberList" :key="member" class="text-dark">
                    <div class="row">
                      <div class="col">
                        {{ member.user.username }}
                      </div>

                      <div class="col">
                      <template v-if="channelMember.owner">
                        <button
                          @click="setMemberAsAdmin(member.user.username)"
                          v-if="member.admin === false"
                        >
                          <span class="material-icons" style="color: grey">star</span>
                        </button>

                        <button
                          @click="unsetMemberAsAdmin(member.user.username)"
                          v-if="member.admin === true && !member.owner"
                        >
                          <span class="material-icons" style="color: #fff774">star</span>
                        </button>
                      </template></div>

                      <template v-if="channelMember.admin">
                          <BanMuteModal class="col"
                            :context="'mute'"
                            :member="member"
                            :socket="socket"
                            :channelId="channelId"
                          />
                          <BanMuteModal class="col"
                            :member="member"
                            :socket="socket"
                            :channelId="channelId"
                          />
                      </template>

                        
                      <div class="col"><template v-if="channelMember.admin">
                        <button
                          @click="kickMember(member.user.username)"
                          v-if="member.admin === false"
                        >
                          <span class="material-icons" style="color: grey">close</span>
                        </button>

                        <button
                          @click="kickMember(member.user.username)"
                          v-if="member.admin && !member.owner && channelMember.owner"
                        >
                          <span class="material-icons" style="color: red">close</span>
                        </button>
                      </template></div>

                      <template v-if="member.admin">(admin)</template>
                      <template v-if="member.muted">(muted)</template>
                      <template v-if="member.banned">(banned)</template>
                    </div>
                  </li>
                </ul>

              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>

          </div>
        </div>
      </div>

  </div>
</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent } from "@vue/runtime-core";
import { Socket } from "socket.io-client";
import http from "../../http-common";
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
      name: "",
      type: this.channelType,
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

    getChannelName() {
      http
        .get("/channel/" + this.channelId)
        .then((response) => {
          console.log("channel name=", response.data.name);
          this.name = response.data.name;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    deleteChannel() {
      this.socket.emit("deleteChannel", this.channelId);
      this.$emit("close");
    },

    changeChannelName() {
      this.name = this.newChannelName;
      const changeChannelName = {
        channelId: this.channelId,
        name: this.newChannelName,
      };
      this.socket.emit("changeChannelName", changeChannelName);
      this.newChannelName = "";
      this.$emit("update");
      console.log("emit update in ChannelSettings, name=", this.name);
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

    // change channel type : public->protected
    addPasswordToPublicChannel() {
      this.socket.emit("addPasswordToPublicChannel", this.passwordI);
      this.passwordI.new = "";
      this.type = "protected";
    },

    // change channel type : protected->public
    removePasswordToProtectedChannel() {
      this.socket.emit("removePasswordToProtectedChannel", this.channelId);
      this.type = "public";
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

  },

  mounted() {
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
      // console.log("user Joined");
      this.getChannelMembers();
    });
    this.socket.on("/userLeft/channel/" + this.channelId, () => {
      // console.log("user Left");
      this.getChannelMembers();
    });
    this.socket.on("/userKicked/" + this.currentUser.userName, () => {
      this.$emit("close");
    });

    this.socket.on("/userUpdated/channel/" + this.channelId, () => {
      // console.log("user (un)muted or (un)banned");
      this.getChannelMembers();
    });

    this.socket.on("/userUpdated/channel/", () => {
      // console.log("user unmuted or unbanned after a limited time");
      this.getChannelMembers();
    });
    this.socket.on("/passwordChanged/", () => {
      this.getChannelMembers();   
    });

  },

  created() {
    this.getChannelMembers();
    this.getChannelName();
  },
});
</script>
