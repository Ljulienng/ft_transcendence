<template>
  <div class="d-flex align-items-center">
    <img :src="this.image" class="small_profile_avatar" />
    <p class="mx-3">{{ userInfo.username }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";

export default defineComponent({
  props: ["username", "isSelected"],

  data() {
    return {
      userInfo: {
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
