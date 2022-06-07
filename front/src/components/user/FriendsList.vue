<template>
  <ul class="list-group mb-2 mt-2">
        <li
          class="list-group-item bg-transparent border-0 text-grey d-flex justify-content-between"
        >
          <div class="col">username</div>
          <div class="col align-middle">firstname</div>
          <div class="col align-middle">lastname</div>
          <div class="col align-middle">status</div>
          <p class="invisible">del</p>
          <p class="invisible">block</p>
        </li>
        <li
          v-for="friend in friendList"
          :key="friend"
          class="list-group-item bg-transparent border-0 text-white d-flex justify-content-between"
        >
          <div class="col">
            <router-link :to="'/public/' + friend.username" class="button">
            {{ friend.username }}
            </router-link>
          </div>
          <div class="col align-middle">{{ friend.firstname }}</div>
          <div class="col align-middle">{{ friend.lastname }}</div>
          <div class="col align-middle">{{ friend.status }}</div>
          <button v-on:click="deleteFriend(friend.username)">
            <span class="material-icons px-1">person_remove</span>
            <!-- <span class="badge bg-primary rounded-pill">X</span> -->
          </button>
          <button v-on:click="blockUser(friend.id)">
            <span class="material-icons px-1" style="color: red">block</span>
          </button>
        </li>
      </ul>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";
import store from "../../store";

export default defineComponent({

  data() {
    return {
        socket: store.getters["auth/getUserSocket"],
        userStatus: "",
        errorMsg: "",
        friendList: [],
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

    blockUser(userToBlock: number) {
      this.socket.emit("blockUser", userToBlock);
      console.log("blockUser", userToBlock);
      // eslint-disable-next-line 
      const x: any = this.friendList.find(d => d["id"] === userToBlock)
      console.log("FRIENDLIST", x.username);
      this.deleteFriend(x.username);
      this.getFriendList();
      this.$forceUpdate();
    },

    async deleteFriend(friendUsername: string) {
      console.log("friend to delete =", friendUsername);
      await http
        .delete("/users/deletefriend", { data: { username: friendUsername } })
        .then((response) => {
          console.log("/users/deletefriend success", response);
          this.getFriendList();
          this.errorMsg = "";
        })
        .catch((error) => {
          this.errorMsg = error.response.data.error;
        });
    },

  },

  mounted() {
     this.socket.on("friendConnected", () => {
      this.getFriendList();
    });

    this.socket.on("friendDisconnected", () => {
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
