<template>
  <div id="chat">
    <div class="createChat">
      <h3>Create new channel</h3>
      Name <input type="text" maxlength="20" v-model="name" />
      <div>
        <div class="one_elem">
          <input type="radio" value="public" v-model="type" />
          <label for="public">Public</label>
        </div>
        <div>
          <input type="radio" value="protected" v-model="type" />
          <label for="protected">Protected</label>
        </div>
        <div>
          <input type="radio" value="private" v-model="type" />
          <label for="private">Private</label>
        </div>
      </div>
      <div v-if="type == 'protected'">
        <input type="password" v-model="password" required />
        <p>Minimun 8 characters</p>
      </div>
      <button @click="createChat">create channel</button>
    </div>
    <br />

    <div>
      <button @click="deleteChat">delete channel with id</button>
      <input type="number" v-model="channelId" />
    </div>
    <br />

    <div>
      <button @click="joinChannel">Join channel with id</button>
      <input type="number" v-model="channelToJoin.id" />
    </div>
    <br />

    <!-- <div class="channelTabs">
                <button @click="showChannel(channel.id)">show channel </button>
                <button @click="showChannel(channel.id)">show channel</button>

        </div> -->
    <nav>
      <div class="nav nav-tabs" id="nav-tab" role="tablist">
        <button
          class="nav-link active"
          id="nav-channel-tab"
          data-bs-toggle="tab"
          data-bs-target="#nav-channel"
          type="button"
          role="tab"
          aria-controls="nav-channel"
          aria-selected="true"
        >
          Channels
        </button>
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
        <div class="channelList">
          <ul>
            <li v-for="channel in channelList" :key="channel">
              <!-- <div v-if="this.joinedChannelList.includes(channel.id) === false"> -->
              {{ channel.id }} : channel "{{ channel.name }}" : created by {{ channel.owner.username }}
              <button  @click="joinChannel(channel.id, channel.type)">
                join channel
              </button>
              <input v-if="channel.type == 'protected'" type="password" maxlength="20" v-model="password" placeholder="password" />
              
              <!-- </div> -->
              <!-- {{channel.message}} -->
            </li>
          </ul>
          <div v-if="showBox === true">
            <ChannelBox
              v-bind:channel="selectedChannel"
              v-bind:socketChannel="socket"
            ></ChannelBox>
          </div>
        </div>
      </div>
      <div
        class="tab-pane fade"
        id="nav-friends"
        role="tabpanel"
        aria-labelledby="nav-friends-tab"
      >
        <div class="friendList">
          <ul>
            <li v-for="friend in friendList" :key="friend">
              {{ friend.username }}
              <button @click="showUser(friend.id)">show chat</button>
            </li>
          </ul>
          <div v-if="showChatBox === true">
            <PrivateChatBox
              v-bind:receiverId="selectedUser"
              v-bind:socket="socket"
            ></PrivateChatBox>
          </div>
        </div>
      </div>
      <div
        class="tab-pane fade"
        id="nav-joinedChannel"
        role="tabpanel"
        aria-labelledby="nav-joinedChannel-tab"
      >
        <div class="joinedChannelList">
          <ul>
            <li v-for="channel in joinedChannelList" :key="channel">
              {{ channel.id }} - "{{ channel.name }}" : created by
              {{ channel.owner.username }}
              <button @click="showChannel(channel.id)">show channel</button>

              <!-- {{channel.messages}} -->
            </li>
          </ul>
          <div v-if="showBox === true">
            <ChannelBox
              v-bind:channel="selectedChannel"
              v-bind:socketChannel="socket"
            ></ChannelBox>
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
import MessageI from "../../types/interfaces/message.interface";
import ChannelI from "../../types/interfaces/channel.interface";
import ChannelBox from "./ChannelBox.vue";
import PrivateChatBox from "./PrivateChatBox.vue";
import store from "../../store";

export default defineComponent({
  components: {
    ChannelBox,
    PrivateChatBox,
  },

  data() {
    return {
      socket: store.getters["auth/getUserSocket"],
      channelList: [] as any[],
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
        // userId: 0,
      },
      messageList: [] as MessageI[],
      name: "",
      password: "",
      passwordJoinChannel: "",
      type: "public",
      channelId: 0,
      selectedChannel: 0,
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
      if (this.showChatBox === true && userId === this.selectedUser) {
        this.showChatBox = false;
      } else if (this.showChatBox === true && userId !== this.selectedUser) {
        this.selectedUser = userId;
      } else {
        this.showChatBox = true;
        this.selectedUser = userId;
      }
    },

    showChannel(channelId: number) {
      if (this.showBox === true && channelId === this.selectedChannel) {
        this.showBox = false;
      } else if (this.showBox === true && channelId !== this.selectedChannel) {
        this.selectedChannel = channelId;
      } else {
        this.showBox = true;
        this.selectedChannel = channelId;
      }
    },

    async checkIfJoined(channelId: number) {
      let bool;
      await this.joinedChannelList.forEach((channel) => {
        if (channelId === channel.id) bool = true;
      });
      console.log("bool = ", bool, "for userId = ", channelId);
      if (bool === true) return true;
      // if (bool === true)
      //   return bool
      else {
        console.log("ntm");
        return false;
      }
    },

    async getChannelList() {
      try {
        const response = await http.get("/channel");
        this.channelList = response.data;
      } catch (error) {
        console.log(error);
      }
    },

    async getJoinedChannelList() {
      try {
        const response = await http.get("/users/joinedchannel");
        // this.channelList = response.data;
        console.log("get joinedchannelList : ", response.data);
        this.joinedChannelList = response.data;
      } catch (error) {
        console.log(error);
      }
    },

    async getMessageList() {
      try {
        const response = await http.get(
          "/channel/" + this.channelId + "/messages"
        );
        // console.log(data);

        this.messageList = response.data;
        console.log(
          "get messageList of channel ",
          this.channelId,
          " : ",
          response.data
        );
      } catch (error) {
        console.log(error);
      }
    },

    createChat() {
      console.log(
        "chat created : name=",
        this.name,
        " type=",
        this.type,
        " password=",
        this.password
      );
      let channel = {
        name: this.name,
        type: this.type,
        password: this.password,
      };
      // http.post("/channel/createChannel", channel, { withCredentials: true });
      this.socket.emit("createChannel", channel);
      this.name = "";
      this.type = "public";
      this.password = "";
    },

    deleteChat() {
      console.log("delete channel");
      this.socket.emit("deleteChannel", this.channelId);
      // http.delete("/channel/" + this.channelId);
      // this.getChannelList();
      this.channelId = 0;
    },

    joinChannel(channelId: number, channelType: string) {
      const channelToJoin = {
        id: channelId,
        type: channelType,
        password: this.password,
      };
      console.log("join channel : ", channelToJoin);
      this.socket.emit("joinChannel", channelToJoin);
    },
 
  },

  mounted() {
    if (this.socket === undefined) {
      this.socket = store.getters["auth/getUserSocket"];
    }

    this.socket.on("updateChannel", (data: ChannelI[]) => {
      this.channelList = data;
    });

    this.socket.on("updateJoinedChannel", (data: ChannelI[]) => {
      this.joinedChannelList = data;
    });
    // this.socket.on('sendMessageToClient', (data) => {
    //     console.log(data);
    // // })

    // this.socket.on('channelJoined', (data) => {
    //     console.log(data);
    // })
  },

  // beforeMount() {
  //     if (this.socket === undefined) {
  //             // this.socket = store.getters["auth/getUserSocket"]

  //         this.socket =  store.getters["auth/getUserSocket"]
  //         console.log('bruh', this.socket);
  //     }
  // },

  created() {
    this.getFriendList();
    this.getJoinedChannelList();
    this.getChannelList();
    // http.get('/message/norminet').then((response) => {
    //   console.log(response)
    // })
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
