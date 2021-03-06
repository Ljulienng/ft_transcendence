<template>
  <div id="chat">

    <!-- TABS HEADERS -->
    <nav>
      <div class="nav nav-tabs" id="nav-tab" role="tablist">

        <button class="nav-link active" id="nav-friends-tab" data-bs-toggle="tab" data-bs-target="#nav-friends"
          type="button" role="tab" aria-controls="nav-friends" aria-selected="true">
          friends
        </button>

        <button class="nav-link" id="nav-joinedChannel-tab" data-bs-toggle="tab" data-bs-target="#nav-joinedChannel"
          type="button" role="tab" aria-controls="nav-joinedChannel" aria-selected="false">
          channels
        </button>

      </div>
    </nav>

    <!-- TABS CONTENT -->
    <div class="tab-content" id="nav-tabContent">

      <!-- PRIVATE CHATS -->
      <div class="tab-pane fade show active" id="nav-friends" role="tabpanel" aria-labelledby="nav-friends-tab">
        <div class="friendList">
          <div class="btn-group-vertical col-12 mx-auto row" role="group" aria-label="Basic example">
            <span class="row" v-for="friend in friendList" :key="friend">
              <button type="button" class="btn col" @click="showUser(friend.id)">
                <PrivateChatListElem :username="friend.username" :id="friend.id"
                  :is-selected="friend.id === selectedUser" />
              </button>
              <div class="col d-flex align-items-center justify-content-end" style="display:block">
                <invitation-button v-bind:userToInvite="friend.id" v-bind:socket="socket" />
              </div>
            </span>
          </div>

        </div>
      </div>


      <!-- CHANNELS -->
      <div class="tab-pane fade" id="nav-joinedChannel" role="tabpanel" aria-labelledby="nav-joinedChannel-tab">
        <div class="row my-2">
          <ChannelList :channelList="channelListWithoutPrivate" @join="joinChannel" />
        </div>

        <div class="joinedChannelList">

          <div class="btn-group-vertical col-12 mx-auto" role="group" aria-label="channels">
            <button type="button" class="btn" v-for="channel in joinedChannelList" :key="channel"
              @click="showChannel(channel.id, channel.type)">
              <div class="col">
                <ChannelListElem :id="channel.id" :type="channel.type" :name="channel.name"
                  :owner="channel.owner.username" :leave="true" @leave="leaveChannel" />
              </div>

            </button>



          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";
import PrivateChatListElem from "./PrivateChatListElem.vue";
import ChannelListElem from "./ChannelListElem.vue";
import ChannelList from "./ChannelList.vue";
import store from "../../store";
import InvitationButton from "../game/InvitationButton.vue";

export default defineComponent({
  components: {
    PrivateChatListElem,
    ChannelListElem,
    ChannelList,
    InvitationButton,
  },

  data() {
    return {
      socket: store.getters["auth/getUserSocket"],
      currentUser: store.getters["auth/getUserProfile"],
      channelList: [] as any[],
      channelListWithoutPrivate: [] as any[],
      joinedChannelList: [] as any[],
      friendList: [],
      message: {
        content: "",
        channelId: 0,
      },
      channelToJoin: {
        id: 0,
        type: "",
        password: "",
      },
      name: "",
      password: "",
      passwordJoinChannel: "",
      channelId: 0,
      selectedChannel: 0,
      selectedChannelType: "",
      selectedUser: 0,
      showBox: false,
      showChatBox: false,
    };
  },

  methods: {
    async getFriendList() {
      try {
        const response = await http.get("/users/friendlist");
        this.friendList = response.data;
      } catch (e) {
        console.log(e);
      }
    },

    showUser(userId: number) {
      this.$emit('type', "priv");
      this.$emit('conv', userId);
      this.$emit('privacy', "private");
    },

    showChannel(channelId: number, channelType: string) {
      this.$emit('type', "chan");
      this.$emit('conv', channelId);
      this.$emit('privacy', channelType);
    },

    updateChannelListWithoutPrivate() {
      this.channelListWithoutPrivate = [];
      for (var channel of this.channelList) {
        if (channel.type !== "private") {
          this.channelListWithoutPrivate.push(channel);
        }
      }
    },

    async getChannelList() {
      try {
        const response = await http.get("/channel");
        this.channelList = response.data;
        this.updateChannelListWithoutPrivate();
      } catch (error) {
        console.log(error);
      }
    },

    async getJoinedChannelList() {
      try {
        const response = await http.get("/users/joinedchannel");
        this.joinedChannelList = response.data;
      } catch (error) {
        console.log(error);
      }
    },

    joinChannel(channelId: number, channelType: string, pwd: string) {
      this.password = pwd;
      const channelToJoin = {
        id: channelId,
        type: channelType,
        password: this.password,
      };
      this.socket.emit("joinChannel", channelToJoin);
      this.$emit("update");
      this.password = "";
      this.getJoinedChannelList();
      this.getChannelList();
    },

    leaveChannel(channelId: number) {
      this.socket.emit("leaveChannel", channelId);
      this.$emit('close');
    },
  },

  mounted() {
    if (this.socket === undefined) {
      this.socket = store.getters["auth/getUserSocket"];
    }

    this.socket.on("updateChannel", () => {
      this.getChannelList();
      this.getJoinedChannelList();
    });

    this.socket.on("/userKicked/" + this.currentUser.userName, () => {
      this.getJoinedChannelList();
    });

  },

  created() {
    this.getFriendList();
    this.getJoinedChannelList();
    this.getChannelList();
  },
});
</script>

<style scoped>
div {
  color: white;
}

ul {
  padding-left: 10%;
}

button {
  color: white;
  border: thin solid #cccccc;
}
</style>
