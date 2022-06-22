<template>
  <div>

    <div v-if="sender !== currentUser">
      <div class="username">{{ sender }}</div>

      <div class="from text-break">
        {{ content }}
      </div>
    </div>

    <div class="w-100" style="display: inline-block;" v-if="sender === currentUser">
        <div class="username text-end">you</div>

        <div class="to text-break float-end">
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
  width: fit-content;
  max-width: 60%;
  padding-left: 3%;
  padding-right: 3%;
}

.to {
  background-color: #fff774;
  border-radius: 20px;
  padding: 10px;
  width: fit-content;
  max-width: 60%;
  padding-left: 3%;
  padding-right: 3%;
}
</style>
