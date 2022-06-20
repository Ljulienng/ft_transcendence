<template>
  <div id="chat">
    <nav>
      <div class="nav nav-tabs" id="nav-tab" role="tablist">
        <!-- <button
          class="nav-link active"
          id="nav-channel-tab"
          data-bs-toggle="tab"
          data-bs-target="#nav-channel"
          type="button"
          role="tab"
          aria-controls="nav-channel"
          aria-selected="true"
          @click="
            showBox = false;
            showChatBox = false;
          "
        >
          Channels -->
        <!-- </button> -->
        <button
          class="nav-link"
          id="nav-friends-tab"
          data-bs-toggle="tab"
          data-bs-target="#nav-friends"
          type="button"
          role="tab"
          aria-controls="nav-friends"
          aria-selected="false"
        >
          Friends
        </button>
        <button
          class="nav-link"
          id="nav-joinedChannel-tab"
          data-bs-toggle="tab"
          data-bs-target="#nav-joinedChannel"
          type="button"
          role="tab"
          aria-controls="nav-joinedChannel"
          aria-selected="false"
        >
          My channels
        </button>
      </div>
    </nav>
    <div class="tab-content" id="nav-tabContent">
      <div
        class="tab-pane fade show active"
        id="nav-channel"
        role="tabpanel"
        aria-labelledby="nav-channel-tab"
      >
        <!-- CHANNEL LIST -->
        <!-- <div>
          <ChannelList @join="joinChannel"/>
        </div> -->
        <!-- <div class="channelListWithoutPrivate">
          <ul>
            <li v-for="channel in channelListWithoutPrivate" :key="channel">
              {{ channel.id }} [{{ channel.type }}] : channel "{{
                channel.name
              }}" : created by {{ channel.owner.username }}
              <button @click="joinChannel(channel.id, channel.type)">
                join channel
              </button>
              <input
                v-if="channel.type == 'protected'"
                type="password"
                maxlength="20"
                v-model="password"
                placeholder="password"
              />
            </li>
          </ul>
          <div v-if="showBox === true">
            <ChannelBox
              v-bind:channel="selectedChannel"
              v-bind:socketChannel="socket"
              @close="showBox = false"
            ></ChannelBox>
          </div> 
        </div> -->
      </div>

      <!-- PRIVATE CHATS -->
      <div
        class="tab-pane fade"
        id="nav-friends"
        role="tabpanel"
        aria-labelledby="nav-friends-tab"
      >
        <div class="friendList">

          <div class="btn-group-vertical col-12 mx-auto" role="group" aria-label="Basic example">
            <button type="button" class="btn" v-for="friend in friendList" :key="friend" @click="showUser(friend.id)">
              <PrivateChatListElem :username="friend.username" :is-selected="friend.id===selectedUser"/>
          <!-- <div
            class="btn-group-vertical col-12 mx-auto"
            role="group"
            aria-label="Basic example"
          >
            <button
              type="button"
              class="btn"
              v-for="friend in friendList"
              :key="friend"
              @click="showUser(friend.id)"
            >
              <UserBox :username="friend.username" :is-selected="false" /> -->
            </button>
          </div>

        </div>
      </div>


      <!-- CHANNELS -->
      <div
        class="tab-pane fade"
        id="nav-joinedChannel"
        role="tabpanel"
        aria-labelledby="nav-joinedChannel-tab"
      >
        <div class="row my-2">
          <ChannelList @join="joinChannel"/>
        </div>

        <div class="joinedChannelList">

          <div class="btn-group-vertical col-12 mx-auto" role="group" aria-label="channels">
            <button type="button" class="btn" v-for="channel in joinedChannelList" :key="channel" @click="showChannel(channel.id, channel.type)">
              <ChannelListElem 
                :id="channel.id"
                :type="channel.type"
                :name="channel.name"
                :owner="channel.owner.username"
              />
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
import ChannelI from "../../types/interfaces/channel.interface";
import ChannelBox from "./ChannelBox.vue";
import PrivateChatBox from "./PrivateChatBox.vue";
import PrivateChatListElem from "./PrivateChatListElem.vue";
import ChannelListElem from "./ChannelListElem.vue";
import ChannelList from "./ChannelList.vue";
import store from "../../store";

export default defineComponent({
  components: {
    PrivateChatBox,
    PrivateChatListElem,
    ChannelBox,
    ChannelListElem,
    ChannelList,
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
      // type: "public",
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
      console.log("channelListWithoutPrivate : ", this.channelListWithoutPrivate);
    },

    async getChannelList() {
      try {
        const response = await http.get("/channel");
        this.channelList = response.data;
        console.log("channelList : ", this.channelList);
        this.updateChannelListWithoutPrivate();
      } catch (error) {
        console.log(error);
      }
    },

    async getJoinedChannelList() {
      try {
        const response = await http.get("/users/joinedchannel");
        console.log("get joinedchannelList : ", response.data);
        this.joinedChannelList = response.data;
      } catch (error) {
        console.log(error);
      }
    },

    joinChannel(channelId: number, channelType: string, pwd: string) {
      this.password = pwd;
      console.log('joinChannel parent ', channelId, channelType);
      const channelToJoin = {
        id: channelId,
        type: channelType,
        password: this.password,
      };
      this.socket.emit("joinChannel", channelToJoin);
      this.password = "";
    },

    leaveChannel(channelId: number) {
      this.socket.emit("leaveChannel", channelId);
    },
  },

  mounted() {
    if (this.socket === undefined) {
      this.socket = store.getters["auth/getUserSocket"];
    }

    this.socket.on("updateChannel", () => {
      console.log("updateChannel");
      this.getChannelList();
      this.getJoinedChannelList();
      this.socket.emit("updateJoinedChannels");
    });

    this.socket.on("updateJoinedChannel", (data: ChannelI[]) => {
      console.log("updateJoinedChannel");
      this.getChannelList();
    });

    this.socket.on("/userKicked/" + this.currentUser.userName, () => {
      this.getJoinedChannelList();
    });
    this.socket.on("/joinChannelError/", (data: string) => {
      console.log(data);
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
