<template>
  <div class="app">
    <Sidebar />
    <FirstTimeModal
      v-if="getUserProfile.firstTime === true"
      v-bind:currentUser="getUserProfile"
    />
    <Notification v-if="getUserProfile.id !== 0" v-bind:currentUser="getUserProfile"/>
    <router-view />
    <!-- <teleport :to="someVar" v-if="someVar"> -->
    <div id="my-modals" />
    <!-- <MyModal /> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
// import http from "./http-common";
import store from "./store";
import router from "./router";
import FirstTimeModal from "./components/auth/FirstTimeModal.vue";
import Notification from "./components/Notification.vue";

import { mapGetters } from "vuex";

export default defineComponent({
  computed: {
    ...mapGetters("auth", {
      getUserProfile: "getUserProfile",
    }),
  },

  components: {
    FirstTimeModal,
    Notification,
  },

  methods: {
    setOffline() {
      const userSocket = store.getters["auth/getUserSocket"].id;

      if (!userSocket) store.dispatch("auth/setUserSocket");
      store.dispatch("auth/setUserStatus", "Offline");
    }
  },

  async beforeCreate() {
    let userProfile = store.getters["auth/getUserProfile"];

    if (userProfile.id === 0) {
      await store.dispatch("auth/userProfile");
      userProfile = store.getters["auth/getUserProfile"];
      console.log("userprofile beforecreate = ", userProfile.id);
    }

    if (userProfile.id === 0) router.push("http://localhost:3001/authmodal");
    // const user = store.getters["auth/getUserProfile"];
    if (userProfile.id !== 0) {
      const socket = store.getters["auth/getUserSocket"];
      socket.on('moveToMatch', () => {console.log('MATCH'); this.$router.push("/play");})

    }


    // if (user.id) await store.dispatch("auth/setUserStatus", "Online");
  },

  created() {
    console.log('created')
    window.addEventListener("beforeunload", this.setOffline);
    // if (this.getUserProfile.status === "Offline") store.dispatch("auth/setUserStatus", "Online");
    // console.log('user status', store.getters["auth/getUserProfile"].status)
  },
});
</script>

<script></script>

<style lang="scss">
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");
@import url("https://fonts.googleapis.com/css2?family=Orbitron&display=swap");

:root {
  --primary: #fff774;
  --primary-alt: #fff774;
  --grey: #c4c4c4;
  --dark: #2e2e2e;
  --dark-alt: #595959;
  --light: #f1f5f9;
  --sidebar-width: 250px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Fira sans", sans-serif;
}
body {
  background-color: var(--dark);
  background-image: url("~@/assets/background.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  height: 100vh;
  overflow: hidden;
}
button {
  cursor: pointer;
  appearance: none;
  border: none;
  outline: none;
  background: none;
}

.app {
  display: flex;
  main {
    flex: 1 1 0;
    padding: 2rem;
    @media (max-width: 1024px) {
      padding-left: 6rem;
    }
  }

  $primary: #fff774;
  @import "bootstrap";

  h1 {
    color: #fff774;
    font-size: 125px;
    font-family: "Inter";
  }
}
</style>
