<template>

    <div class="row">

      <div class="col-auto">

        <div class="d-flex align-items-center justify-content-center small_yellow_circle">
          <i style="color: black" v-if="type==='public'" class="material-icons">public</i>
          <i style="color: black" v-if="type==='protected'" class="material-icons">vpn_lock</i>
          <i style="color: black" v-if="type==='private'" class="material-icons">lock</i>
        </div>
      
      </div>

      <div class="col float-left">

        <p class="mx-3">{{ name }}</p>
        <p class="owner mx-3">created by {{ owner }}</p>

      </div>
      
    </div>

</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  props: ["id",
            "type",
            "name",
            "owner"],
});
</script>

<style lang="scss" scoped>
 
  .owner {
      color: rgb(44, 44, 44);
      font-size: 12px;
      font-family: 'Inter';
      font-weight: 600;
      font-style: italic;
  }

</style>