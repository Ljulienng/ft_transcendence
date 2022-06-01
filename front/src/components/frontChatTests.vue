<template>
  <div id="chat">
    <div class="form">
      <form>
        <h5>Create new channel</h5>
        <br />
        <input
          type="text"
          class="field"
          maxlength="20"
          v-model="name"
          placeholder="Channel name..."
          required
        />
        <br />
        <toggle-switch
          class="toggle_switch"
          :options="myOptions"
          @change="privacy = $event.value"
        />
        <div v-if="privacy == 'protected'">
          <input
            type="password"
            class="field"
            :disabled="false"
            v-model="password"
            placeholder="Password..."
            required
          /><br />
          <span v-if="err.password" class="error">{{ err.password }}</span>
          <br />
        </div>
        <div v-else>
          <input
            type="text"
            class="field"
            :disabled="true"
            v-model="password"
            placeholder="Password..."
          /><br />
          <br />
        </div>
        <br />
        <input type="submit" class="mybtn" value="Submit" @submit="checkForm" />
        <!-- value="create channel" @click="createChat" -->
      </form>
    </div>
    <br />

    <div>
      <button @click="deleteChat">delete channel with id</button>
      <input type="number" v-model="channelId" />
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
    <br />

    <!-- <div class="channelTabs">
								<button @click="showChannel(channel.id)">show channel </button>
								<button @click="showChannel(channel.id)">show channel</button>

				</div> -->
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
import ChannelBox from "./chat/ChannelBox.vue";
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
      privacy: "",
      channelId: 0,
      selectedChannel: 0,
      showBox: false,
      user: "",
      err: {} as { [key: string]: string },
      myOptions: {
        layout: {
          color: "black",
          backgroundColor: "#c4c4c4",
          selectedColor: "black",
          selectedBackgroundColor: "#fff774",
          fontFamily: "Inter",
          fontWeight: "normal",
          fontWeightSelected: "bold",
          squareCorners: false,
          noBorder: true,
        },
        size: {
          fontSize: 1,
          height: 2,
          padding: 0.5,
          width: 30,
        },
        items: {
          delay: 0.4,
          preSelected: "private",
          disabled: false,
          labels: [
            { name: "public" },
            { name: "private" },
            { name: "protected" },
          ],
        },
      },
    };
  },

  watch: {
    password(value) {
      this.password = value;
      this.validatePassword(value);
    },
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
        " privacy=",
        this.privacy,
        " password=",
        this.password
      );
      let channel = {
        name: this.name,
        privacy: this.privacy,
        password: this.password,
      };
      http.post("/channel/createChannel", channel, { withCredentials: true });
      this.getChannelList();
      this.name = "";
      this.privacy = "";
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

    validatePassword(value: string) {
      let difference = 8 - value.length;
      if (difference > 0) {
        this.err["password"] = "Must be at least 8 characters";
      } else {
        this.err["password"] = "";
      }
    },

    checkForm(): boolean {
      console.log("Check Create Channel form");
      if ("password" in this.err && this.err["password"] != "") {
        return false;
      }
      this.createChat();
      return true;
    },
    // sendMessage() {
    //     console.log('sendMessage - on channelId ', this.message.channelId, this.message.content);
    //     this.socket.emit('sendMessageToServer', this.message);
    // },
  },

  mounted() {
    if (this.socket === undefined) {
      // this.socket = store.getters["auth/getUserSocket"]

      this.socket = store.getters["auth/getUserSocket"];
      console.log("bruh", this.socket);
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

<style src="../assets/css/home.css" scoped>
*/
	div {
			color: white;
	}
	ul {
padding-left: 10%;
	}
	button {
			color: white;
			border: thin solid #CCCCCC
	}
	.myOptions {
			color: blue;
	}
	.myOptions .layout {
			color: 'green';
	}
	.myOptions .size {
			height: 34;
			padding: 7;
			width: 100;
	}
	.myOptions .items {
			--delay: .4;
			--preSelected: 'unknown';
			--disabled: false;
			--labels: [
					{name: 'Off', color: 'white', backgroundColor: 'blue'},
					{name: 'On', color: 'white', backgroundColor: 'blue'}
					];
			/* --labels: [
					{name: 'Public', color: 'white', backgroundColor: 'green'},
					{name: 'Private', color: 'white', backgroundColor: 'green'},
					{name: 'Protected', color: 'white', backgroundColor: 'green'}
			] */
	}
</style>
