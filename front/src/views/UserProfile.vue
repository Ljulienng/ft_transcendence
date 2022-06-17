<template>
  <div class="userProfile mx-auto p-4">
    <TwoFactorModal />
    <div class="d-flex mx-auto justify-content-evenly" style="width:70%">
      <div class="d-block text-center">
        <UploadAvatar v-on:updateAvatar="updateAvatar"/>
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
// import http from "../http-common";
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
      socket: store.getters['auth/getUserSocket'],
      currentUser: store.getters["auth/getUserProfile"],
    };
  },

  methods: {
    updateAvatar() {
      this.socket.emit('updateAvatar')
    }
  }


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
