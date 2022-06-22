<template>
  <th class="text-left">
    <router-link :to="'/public/' + username" class="button text-decoration-none">
      <img :src="this.image" class="small_profile_avatar" />
      {{ username }}
    </router-link>
  </th>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";

export default defineComponent({
  /* eslint-disable */

  props: ["username"],
  data() {
    return {
      image: null as any,
    };
  },

  methods: {
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
    this.getAvatar();
  },
});
</script>
