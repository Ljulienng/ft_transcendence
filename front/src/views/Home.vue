<template>
	<h1>Welcome, {{getUserProfile.userName}}</h1>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Home",
  computed: {
    ...mapGetters("auth", {
      getUserProfile: "getUserProfile",
    }),
  }
};
</script>