<template>
  <div>
    <div v-if="sender !== currentUser">
      <p class="username">{{ sender }}</p>

      <div class="container-sm from">
        {{ content }}
      </div>
    </div>

    <div v-if="sender === currentUser">
      <p class="username">you</p>

      <div class="container to">
        {{ content }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  props: ["sender", "content", "currentUser"],

  data() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.username {
  font-size: small;
  margin: 0%;
}

.from {
  background-color: #c4c4c480;
  border-radius: 20px;
  padding: 10px;
}

.to {
  background-color: #fff774;
  border-radius: 20px;
  padding: 10px;
}
</style>
