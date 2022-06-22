<template>
  <div
    class="modal fade"
    id="staticBackdrop"
    ref="twoFaModal"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    tabindex="-1"
    aria-labelledby="staticBackdropLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <form v-on:submit.prevent="authenticateTwoFA">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">
              Two Factor Authentication
            </h5>
          </div>
          <div class="modal-body">
            <p>Enter authentification code</p>
            <p v-if="errorMsg !== ''" style="color: red; font-size: 12px">
              {{ errorMsg }}
            </p>
            <p>
              <label class="modal-label" for="twoFA"></label>
              <input
                id="TwoFA"
                class="form-control"
                v-model="twoFA.twoFactorAuthenticationCode"
                type="text"
                username="TwoFA"
              />
            </p>
          </div>
          <div class="modal-footer">
            <input type="submit" value="submit" class="btn btn-primary" />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { mapGetters } from "vuex";
import { Modal } from "bootstrap";
import store from "../../store";
import http from "../../http-common";
/* eslint-disable */

export default defineComponent({
  computed: {
    ...mapGetters("auth", {
      getUserProfile: "getUserProfile",
    }),
  },

  data() {
    return {
      socket: store.getters["auth/getUserSocket"],
      errorMsg: "",
      twoFA: {
        twoFactorAuthenticationCode: "",
      },
      modal: null as any,
    };
  },

  methods: {
    async authenticateTwoFA() {
      await http
        .post("/twofa/authenticate", this.twoFA, { withCredentials: true })
        .then(() => {
          this.$store.dispatch("auth/setTwoFAauth");
          this.modal.dispose();
          this.$router.push("http://localhost:3001/home");
          this.socket.emit("updateAvatar");
        })
        .catch((error) => {
          this.errorMsg = error.response.data.message;
        });
    },
  },

  mounted() {
    this.modal = new Modal(this.$refs.twoFaModal as any);
    this.modal.show();
  },
});
</script>
