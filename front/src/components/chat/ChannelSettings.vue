<template>
  <div>
    <ul>
      <li v-for="member in memberList" :key="member">
        <div v-if="member.owner">owner: {{ member.user.username }}</div>
        <div v-else>
          {{ member.user.username }}
          <template v-if="member.admin">(admin)</template>
          <template v-if="member.muted">(muted)</template>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";

export default defineComponent({
  props: {
    currentUser: Object,
    channelId: Number,
  },

  data() {
    return {
      memberList: [],
      isAdmin: false,
      isOwner: false,
    };
  },

  methods: {
    async getChannelMembers() {
      this.memberList = await http
        .get("/channel/" + this.channelId + "/members")
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    async checkIfAdmin() {
      const user = this.memberList.find(
        (member) => this.currentUser.userName === member.user.username
      );
      if (user.admin) this.isAdmin = true;
      if (user.owner) this.isOwner = true;
      console.log("memberList = ", this.memberList, this.isAdmin, this.isOwner);
    },
  },

  created() {
    this.getChannelMembers().then(() => {
      this.checkIfAdmin();
    });
    // console.log("data = ", this.memberList());
    // this.checkIfAdmin();
  },
});
</script>
