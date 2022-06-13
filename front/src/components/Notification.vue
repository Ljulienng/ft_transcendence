<template>
  <div class="toast-container">
    <div ref="test"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { Toast } from "bootstrap";

export default defineComponent({
  methods: {
    createToast() {
      const toast = new Toast("test toast");
    },
  },
});
</script>
