<template>
  <!-- <div id="friend"> -->
  <div id="friend" class="pl-6" style="padding-right: 20px">
    <!-- Button trigger modal -->
    <div class="d-flex align-items-center mt-4">
      <h3>friends</h3>
      <button class="btn" data-bs-toggle="modal" data-bs-target="#friendModal">
        <i style="color: #fff774" class="material-icons">person_add_alt_1</i>
      </button>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="friendModal" ref="Modal" tabindex="-1" aria-labelledby="friendModalLabel"
      aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="friendModalLabel">Add friend</h5>
            <button id="closeModalButton" type="button" class="btn-close" data-bs-dismiss="modal"
              aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form class="needs-validation" novalidate v-on:submit.prevent="addFriend">
              <div class="row align-items-center justify-content-between">
                <div class="col">
                  <div class="position-relative">
                    <input id="id" class="form-control" v-model="friendToAdd.friendUsername" type="text" name="id"
                      maxlength="20" placeholder="Username..." @input="test" required />
                  </div>
                  <div id="idHelp" class="form-text" v-if="errorMsg !== ''" style="color: red">
                    {{ errorMsg }}
                  </div>
                </div>
                <div class="col-auto">
                  <div class="mb-4 mt-4 text-center">
                    <button v-if="errorMsg === ''" type="submit" data-bs-dismiss="modal" aria-label="Close">
                      <i style="color: #fff774" class="material-icons">send</i>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <FriendsList :key="updateComp" />

    <div class="d-flex align-items-center mt-4">
      <h3>blocked users</h3>
    </div>

    <div class="container-fluid widebox" style="max-height: 10rem;">
      <BlockedUser :key="updateComp" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../http-common";
import BlockedUser from "../components/user/BlockedUser.vue";
import FriendsList from "../components/user/FriendsList.vue";
import store from "../store";

export default defineComponent({
  components: {
    BlockedUser,
    FriendsList,
  },

  data() {
    return {
      socket: store.getters["auth/getUserSocket"],
      userStatus: "",
      errorMsg: "",
      friendList: [],
      friendToAdd: {
        friendUsername: "",
      },
      userToBlock: 0,
      updateComp: 0,
    };
  },

  methods: {
    // closeModal() {
    // }, 
    test() {
      console.log('test')
      this.errorMsg = ''
    },
    async getFriendList() {
      const response = await http.get("/users/friendlist").catch(() => { console.log('rien') });
      if (response)
        this.friendList = response.data;
      this.updateComp++;

    },

    async addFriend() {
      this.socket.emit("addFriend", this.friendToAdd);
    },

    blockUser(userToBlock: number) {
      this.socket.emit("blockUser", userToBlock);
    },

  },

  mounted() {
    this.socket.on("friendAdded", () => {
      this.getFriendList();
      this.errorMsg = '';
    });

    // eslint-disable-next-line
    this.socket.on("friendAddedError", (data: any) => {
      console.log('errorfriend')
      this.errorMsg = data;
    });

    this.socket.on("friendDeleted", () => {
      this.getFriendList();
    });

    this.socket.on("friendConnected", () => {
      this.getFriendList();
    });

    this.socket.on("friendDisconnected", () => {
      this.getFriendList();
    });

    this.socket.on("friendPlaying", () => {
      this.getFriendList();
    });
  },

  created() {
    this.getFriendList();
  },
});
</script>

<style lang="scss">
</style>
