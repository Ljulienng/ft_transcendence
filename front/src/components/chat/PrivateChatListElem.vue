<template>

  <div class="row">

    <div class="col">
      <Friend v-bind:username="userInfo.username" />
    </div>

    <div class="col">
      <invitation-button v-bind:userToInvite="userInfo.id" v-bind:socket="socket" />
    </div>
    
  </div>

</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";
import store from "../../store";
import Friend from "../user/Friend.vue";
import InvitationButton from "../game/InvitationButton.vue";

export default defineComponent({
  props: ["username", "isSelected"],

  components: {
      Friend,
      InvitationButton,
  },

  data() {
    return {
      socket: store.getters["auth/getUserSocket"],
      userInfo: {
        id: 0,
        username: "",
      },
      // eslint-disable-next-line
      image: null as any,
    };
  },

  methods: {
    async getuserInfo() {
      await http
        .get("/users/public/" + this.username)
        .then((response) => {
          console.log("reponse = ", response);
          this.userInfo = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    async getAvatar() {
      http
        .get("/users/avatar/" + this.username, {
          responseType: "blob",
        })
        .then((response) => {
          const blob = response.data;
          this.image = URL.createObjectURL(blob);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },

  created() {
    this.getuserInfo();
    this.getAvatar();
  },
});
</script>
