<template>
  <div class="body">
    <div class="welcome">
      Welcome, {{getUserProfile.userName}}
    </div>
    <div class="split">
      <div class="lcol">
        <div class="centered">
            <h4>points to victory</h4>
            <div>
              <button class="left_arrow"></button>
              <p class="point2win">3</p>
              <button class="right_arrow"></button>
            </div>
          <br>
          <h4>theme</h4>
            <div>
              <button class="left_arrow"></button>
              <p class="theme">classic</p>
              <button class="right_arrow"></button>
            </div>
          <br>
          <button class="mybtn">play</button>
        </div>
      </div>
      <div class="rcol">
        <div class="left-aligned">
          <h1>tran</h1>
          <h1>scen</h1>
          <h1>dence.</h1>
          <br>
        </div>
      </div>
      <div style="clear:both"></div>
    </div>
  </div>
</template>

<script lang="ts">
import '../assets/css/style.scss'
import { defineComponent } from "@vue/runtime-core";
import { mapGetters } from "vuex";

export default defineComponent({
  name: "Home",
  computed: {
    ...mapGetters("auth", {
      getUserProfile: "getUserProfile",
    }),
  }
});
</script>


<style src="../assets/css/home.css" scoped>
</style>
