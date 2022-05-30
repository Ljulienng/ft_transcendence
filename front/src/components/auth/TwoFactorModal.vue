<template>
  <div class="twofa">
    <div class="avatar">
      <img :src="this.image" class="Image" />
    </div>
    <div class="twoFAModal">
      <p v-if="errorMsg !== ''" style="color: red; font-size: 12px">
        {{ errorMsg }}
      </p>
      <div v-if="getUserProfile.twoFAEnabled === false">
        <form v-on:submit.prevent="activateTwoFA">
          <p>
            <label for="twoFAcodeActivate">twoFAcodeActivate</label>
            <input
              id="twoFAcodeActivate"
              v-model="twoFA.twoFactorAuthenticationCode"
              type="text"
              twoFactorAuthenticationCode="twoFactorAuthenticationCode"
            />
          </p>
          <p>
            <input type="submit" value="Activate" />
          </p>
        </form>
      </div>
      <form
        v-on:submit.prevent="deactivateTwoFA"
        v-if="getUserProfile.twoFAEnabled === true"
      >
        >
        <p>
          <label for="twoFAcodeDeactivate">twoFAcodeDeactivate</label>
          <input
            id="twoFAcodeDeactivate"
            v-model="twoFA.twoFactorAuthenticationCodeTwo"
            type="text"
            twoFactorAuthenticationCodeTwo="twoFactorAuthenticationCodeTwo"
          />
        </p>
        <p>
          <input type="submit" value="Deactivate" />
        </p>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";
import store from "../../store";
import { mapGetters } from "vuex";

export default defineComponent({
  computed: {
    ...mapGetters("auth", {
      getUserProfile: "getUserProfile",
    }),
  },
  data() {
    return {
      errorMsg: "",
      twoFA: {
        twoFactorAuthenticationCode: "",
        twoFactorAuthenticationCodeTwo: "",
      },
      // eslint-disable-next-line
      image: null as any,
    };
  },

  methods: {
    async getQr() {
      await http
        .get("twofa/generate", { responseType: "blob" })
        .then((response) => {
          const blob = response.data;
          console.log("two fa", response);
          this.image = URL.createObjectURL(blob);
        })
        .catch((error) => {
          console.log("two fa", error);
        });
    },

    async activateTwoFA() {
      console.log("twoFactorAuthenticationCode = ", this.twoFA);
      await http
        .post("/twofa/turn-on", this.twoFA)
        .then((response) => {
          console.log(response);
          window.location.reload();
        })
        .catch((error) => {
          console.log("full error = ", error),
            (this.errorMsg = error.response.data.message);
        });
    },

    async deactivateTwoFA() {
      console.log("twoFactorAuthenticationCode = ", this.twoFA);
      await http
        .post("/twofa/turn-off", this.twoFA)
        .then((response) => {
          console.log(response.data);
          store.dispatch("auth/setTwoFAauth");
          window.location.reload();
        })
        .catch((error) => {
          console.log(
            "full error = ",
            (this.errorMsg = error.response.data.message)
          );
        });
    },
  },

  created() {
    if (store.getters["auth/getUserProfile"].twoFAEnabled === false)
      this.getQr();
  },
});
</script>

<style lang="scss">
.twofa {
  display: flex;
}

img.Image {
  max-width: 100%;
  max-height: 100%;
}

.avatar {
  width: 200px;
  height: 200px;
}

.twoFAModal {
  padding-top: 10px;
}
</style>
