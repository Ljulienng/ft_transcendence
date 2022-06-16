<template>
  <ul class="list-group mb-2 mt-2">
    <li
      class="list-group-item bg-transparent border-0 text-grey d-flex justify-content-between"
      style="width 75%"
    >
      <div class="col text-center">username</div>
      <div class="col text-center">firstname</div>
      <div class="col text-center">lastname</div>
      <div class="col text-center">status</div>
      <div class="col text-center">Actions</div>
      <p class="invisible">del</p>
      <p class="invisible">block</p>
    </li>
    <li
      v-for="friend in friendList"
      :key="friend"
      class="list-group-item bg-transparent border-0 text-white d-flex justify-content-between row"
      style="width 75%"
    >
      <Friend v-bind:username="friend.username" />
      <div class="col text-center">{{ friend.firstname }}</div>
      <div class="col text-center">{{ friend.lastname }}</div>
      <div class="col text-center">{{ friend.status }}</div>
      <div class="col text-center">
        <button v-on:click="deleteFriend(friend.username)">
          <span class="material-icons px-1">person_remove</span>
          <!-- <span class="badge bg-primary rounded-pill">X</span> -->
        </button>
        <invitation-button
          v-bind:userToInvite="friend.id"
          v-bind:socket="socket"
        />
        <button v-on:click="blockUser(friend.id)">
          <span class="material-icons px-1" style="color: red">block</span>
        </button>
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";
import store from "../../store";
import InvitationButton from "../game/InvitationButton.vue";
import Friend from "./Friend.vue";

export default defineComponent({
  /* eslint-disable */
  components: {
    InvitationButton,
    Friend,
  },

  data() {
    return {
      socket: store.getters["auth/getUserSocket"],
      currentUser: store.getters["auth/getUserProfile"],
      userStatus: "",
      errorMsg: "",
      friendList: [],
    };
  },

  methods: {
    async getFriendList() {
      const response = await http.get("/users/friendlist").catch((error) => {
        console.log(error);
      });
      if (response) this.friendList = response.data;
    },

    blockUser(userToBlock: number) {
      this.socket.emit("blockUser", userToBlock);
    },

    async deleteFriend(friendUsername: string) {
      this.socket.emit("deleteFriend", friendUsername);
    },
  },

  mounted() {
    this.socket.on("friendConnected", () => {
      this.getFriendList();
    });

    this.socket.on("friendDisconnected", () => {
      this.getFriendList();
    });

    this.socket.on("updateBlocked/" + this.currentUser.id, () => {
      this.getFriendList();
    });
  },

  created() {
    this.getFriendList();
    // this.friendListloop(5);
  },
});
</script>

<style lang="scss">
body {
  color: white;
}

#friend {
  width: 100%;
  height: 100%;
  padding-left: 100px;
}

.friendList {
  // height: 100%;
  // width: 80%;
  height: 10rem;
  border: 10px, black;
}

li {
  padding: 10px;
  color: white;
}
</style>
