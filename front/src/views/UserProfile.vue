<template>
  <div class="userProfile mx-auto p-4">
    <button class="logout" @click="logout">Logout</button>
    <TwoFactorModal />
    <div class="d-flex mx-auto justify-content-evenly" style="width:70%">
      <div class="d-block">
        <UploadAvatar />
        <UsernameModal />
        <router-link :to="'/public/' + currentUser.userName" class="button text-decoration-none">
          <small> public profile </small> 
        </router-link>

      </div>
      <UserStats v-bind:username="currentUser.userName"/>
    </div>
    <GameHistory v-bind:username="currentUser.userName"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../http-common";
import TwoFactorModal from "../components/auth/TwoFactorModal.vue";
// import UsernameModal from "../components/user/UsernameModal.vue";
import UsernameModal from "../components/user/UsernameModal.vue";
import GameHistory from "../components/user/GameHistory.vue";
import UserStats from "../components/user/UserStats.vue";
import store from "../store";

export default defineComponent({
  components: {
    TwoFactorModal,
    UsernameModal,
    GameHistory,
    UserStats,
  },

  data() {
    return {
      currentUser: store.getters["auth/getUserProfile"],
    };
  },

  methods: {
    setStatus() {
      http.post("/users/setstatus", { newStatus: "Offline" });
      // .then((res) => {
      //   console.log(res);
      // })
      // .catch((err) => {
      //   console.log(err);
      // });
    },

    logout() {
      const userSocket = store.getters["auth/getUserSocket"].id;

      if (!userSocket) store.dispatch("auth/setUserSocket");
      store.dispatch("auth/setUserStatus", "Offline");
      http
        .delete("/logout")
        .then((res) => {
          console.log(res);
          window.location.reload();
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },

  // created() {
  //   console.log("currentUser = ", this.currentUser);
  // },

  // beforeCreate() {
  //   console.log("getUserprofile  = ", this.userProfile);
  // },
});
</script>

<style lang="scss">
.userProfile {
  width: 100%;
}

.logout {
  float: right;
  border: none;
  background: #ededed;
  font-size: 24px;
  color: arial;
  padding: 5px 10px;
}
.logout:hover {
  background: red;
  cursor: pointer;
}
</style>
