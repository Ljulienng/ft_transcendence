<template>
  <div class="mb-2 mt-2">
    <div class="container-fluid widebox" style="max-height: 40rem;">
      <table class="table table-borderless" id="users">
        <thead>
          <tr>
            <th scope="col" v-for="column in columns" :key="column" class="text-center align-middle">
              {{ column }}
            </th>
          </tr>
        </thead>
        <tbody v-for="friend in friendList" :key="friend">
          <tr>
            <Friend v-bind:username="friend.username" />
            <td class="text-center align-middle">{{ friend.firstname }}</td>
            <td class="text-center align-middle">{{ friend.lastname }}</td>
            <td class="text-center align-middle">{{ friend.status }}</td>
            <td class="text-center align-middle">
              <div class="container">
                <div class="row align-items-start">
                  <div class="col px-0">
                    <button v-on:click="deleteFriend(friend.username)">
                      <span class="material-icons px-0">person_remove</span>
                      <!-- <span class="badge bg-primary rounded-pill">X</span> -->
                    </button>
                  </div>
                  <div class="col px-0">
                    <spectate-button v-bind:userToSpectate="friend.id" v-bind:socket="socket" />
                  </div>
                  <div class="col px-0">
                    <invitation-button v-bind:userToInvite="friend.id" v-bind:socket="socket" />
                  </div>
                  <div class="col px-0">
                    <button v-on:click="blockUser(friend.id)">
                      <span class="material-icons px-0" style="color: red">block</span>
                    </button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";
import store from "../../store";
import InvitationButton from "../game/InvitationButton.vue";
import SpectateButton from "../game/SpectateButton.vue";
import Friend from "./Friend.vue";

export default defineComponent({
  /* eslint-disable */
  components: {
    InvitationButton,
    SpectateButton,
    Friend,
  },

  data() {
    return {
      socket: store.getters["auth/getUserSocket"],
      currentUser: store.getters["auth/getUserProfile"],
      userStatus: "",
      errorMsg: "",
      friendList: [],
      columns: ["username", "firstname", "lastname", "status", ""],
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
