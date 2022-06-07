<template>
  <div class="userProfile" style="padding-left: 100px; padding-right: 20px">
    <button class="logout" @click="logout">Logout</button>
    <router-link :to="'/public/' + this.userProfile.username" class="button">
      check public profile
    </router-link>
    <UploadAvatar />
    <TwoFactorModal />
    <UsernameModal />
    <GameHistory v-bind:currentUser="currentUser" />
    <UserStats />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../http-common";
import TwoFactorModal from "../components/auth/TwoFactorModal.vue";
// import UsernameModal from "../components/user/UsernameModal.vue";
import store from "../store";
import UsernameModal from "../components/user/UsernameModal.vue";
import GameHistory from "../components/user/GameHistory.vue";
import UserStats from "../components/user/UserStats.vue";

export default defineComponent({
  components: {
    TwoFactorModal,
    UsernameModal,
    GameHistory,
    UserStats,
  },

  data() {
    return {
      userProfile: store.getters["auth/getUserProfile"]
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
