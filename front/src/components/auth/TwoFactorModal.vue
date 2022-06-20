<template>
  <div class="twofa">
    <button
      type="button"
      class="btn btn-primary"
      data-bs-toggle="modal"
      data-bs-target="#exampleModal"
    >
      <div v-if="getUserProfile.twoFAEnabled === false">Activate TwoFA</div>
      <div v-else>Deactivate TwoFA</div>
    </button>
    <div
      class="modal fade"
      id="exampleModal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header text-center">
            <h5 class="modal-title">Double authentication factor</h5>

            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="twoFAModal m-2">
            <div class="avatar">
              <img :src="this.image" class="Image" />
            </div>
            <div v-if="getUserProfile.twoFAEnabled === false">
              <form v-on:submit.prevent="activateTwoFA">
                <div class="form-floating">
                  <input
                    class="form-control"
                    id="twoFAcodeActivate"
                    v-model="twoFA.twoFactorAuthenticationCode"
                    type="text"
                    twoFactorAuthenticationCode="twoFactorAuthenticationCode"
                  />
                  <label
                    for="twoFAcodeActivate"
                    class="form-label mx-auto text-center"
                    >Authenticator code</label
                  >
                </div>
                <p
                  class="form-text"
                  v-if="errorMsg !== ''"
                  style="color: red; font-size: 12px"
                >
                  {{ errorMsg }}
                </p>
                <button
                  type="button"
                  class="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <input
                  type="submit"
                  class="btn btn-primary m-1"
                  value="Activate"
                />
              </form>
            </div>
            <form
              v-on:submit.prevent="deactivateTwoFA"
              v-if="getUserProfile.twoFAEnabled === true"
            >
              <div class="form-floating">
                <input
                  class="form-control"
                  id="twoFAcodeDeactivate"
                  v-model="twoFA.twoFactorAuthenticationCodeTwo"
                  type="text"
                  twoFactorAuthenticationCodeTwo="twoFactorAuthenticationCodeTwo"
                />
                <label
                  for="twoFAcodeDeactivate"
                  class="form-label mx-auto text-center"
                  >deactivate two factor authentication</label
                >
              </div>
              <p>
                <button
                  type="button"
                  class="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <input
                  type="submit"
                  class="btn btn-primary"
                  value="Deactivate"
                />
              </p>
            </form>
          </div>
        </div>
      </div>
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
        .then(() => {
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
  margin-left: auto;
  margin-right: auto;
  display: block;
}

.twoFAModal {
  padding-top: 10px;
}
</style>
