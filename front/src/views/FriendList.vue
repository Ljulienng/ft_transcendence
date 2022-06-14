<template>
  <!-- <div id="friend"> -->
  <div id="friend" class="pl-6" style="padding-right: 20px">
    <!-- Button trigger modal -->
    <div class="d-flex align-items-center mt-4">
      <h3>friends</h3>
      <button
        class="btn"
        data-bs-toggle="modal"
        data-bs-target="#addFriendModal"
      >
        <i style="color: #fff774" class="material-icons">person_add_alt_1</i>
      </button>
    </div>

    <!-- Modal -->
    <div
      class="modal fade"
      id="addFriendModal"
      tabindex="-1"
      aria-labelledby="addFriendModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addFriendModalLabel">Add friend</h5>
            <button
              id="closeModalButton"
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form
              class="needs-validation"
              novalidate
              v-on:submit.prevent="addFriend"
            >
              <div class="row align-items-center justify-content-between">
                <div class="col">
                  <div class="position-relative">
                    <input
                      id="id"
                      class="form-control"
                      v-model="friendToAdd.friendUsername"
                      type="text"
                      name="id"
                      placeholder="Username..."
                      required
                    />
                  </div>
                  <div
                    id="idHelp"
                    class="form-text"
                    v-if="errorMsg !== ''"
                    style="color: red"
                  >
                    {{ errorMsg }}
                  </div>
                </div>
                <div class="col-auto">
                  <div class="mb-4 mt-4 text-center">
                    <button type="submit" data-bs-dismiss="modal" aria-label="Close">
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

    <div class="container-fluid widebox">
      <FriendsList :key="updateComp" />
    </div>

    <div class="d-flex align-items-center mt-4">
      <h3>blocked users</h3>
    </div>

    <div class="container-fluid widebox">
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
    async getFriendList() {
      try {
        const response = await http.get("/users/friendlist");
        this.friendList = response.data;
        this.updateComp++;
      } catch (e) {
        console.log(e);
      }
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
    });

    this.socket.on("friendConnected", () => {
      this.getFriendList();
    });

    this.socket.on("friendDisconnected", () => {
      this.getFriendList();
    });
  },

  created() {
    this.getFriendList();
  },
});
</script>

<style lang="scss"></style>
