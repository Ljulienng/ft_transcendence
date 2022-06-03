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

    <div>
      <button @click="sendMessage">Send message</button>
      <input
        type="text"
        maxlength="100"
        v-model="message.content"
        class="inputMessage"
      />
      in channel
      <input type="text" maxlength="100" v-model="message.channelId" />
    </div>
    <br />

    <div class="channelList">
      <h3>Channel list</h3>
      <ul>
        <li v-for="channel in channelList" :key="channel">
          {{ channel.id }} - "{{ channel.name }}" : created by
          {{ channel.owner.username }}
          <button @click="joinChannel(channel.id, channel.type)">
            join channel
          </button>
          <button @click="showChannel(channel.id)">show channel</button>

          <!-- {{channel.messages}} -->
        </li>
      </ul>
    </div>
    <div v-if="showBox === true">
      <ChannelBox
        v-bind:channel="selectedChannel"
        v-bind:socketChannel="socket"
      ></ChannelBox>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../http-common";
import MessageI from "../types/interfaces/message.interface";
import ChannelBox from "./ChannelBox.vue";
import store from "../store";

export default defineComponent({
  components: {
    ChannelBox,
  },

  data() {
    return {
      socket: store.getters["auth/getUserSocket"],
      channelList: [],
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
      type: "",
      channelId: 0,
      selectedChannel: 0,
      showBox: false,
    };
  },

  methods: {
    showChannel(channelId: number) {
      if (this.showBox === true && channelId === this.selectedChannel) {
        this.showBox = false;
      } else if (this.showBox === true && channelId !== this.selectedChannel) {
        console.log("test");
        this.selectedChannel = channelId;
      } else {
        this.showBox = true;
        this.selectedChannel = channelId;
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
      } catch (error) {
        console.log(error);
      }
    },

    async getMessageList() {
      try {
        const response = await http.get(
          "/channel/" + this.channelId + "/messages"
        );
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
      http.post("/channel/createChannel", channel, { withCredentials: true });
      this.getChannelList();
      this.name = "";
      this.type = "";
      this.password = "";
    },

    deleteChat() {
      console.log("delete channel");
      http.delete("/channel/" + this.channelId);
      this.getChannelList();
      this.channelId = 0;
    },

    joinChannel(channelId: number, channelType: string) {
      const channelToJoin = {
        id: channelId,
        type: channelType,
        password: "",
        // userId: 0,
      };

      console.log("join channel : ", channelToJoin);
      this.socket.emit("joinChannel", channelToJoin);
    },
  },

  mounted() {
    if (this.socket === undefined) {
      this.socket = store.getters["auth/getUserSocket"];
    }

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
    this.getChannelList();
    this.getJoinedChannelList();
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
