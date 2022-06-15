<template>
  <div>
    <a
      type="button"
      data-bs-toggle="modal"
      data-bs-target="#usernameModal"
      class="primary text-decoration-none display-5"
    >
      {{ getUserProfile.userName }}
      <i style="color: #fff774" class="material-icons">border_color</i>
    </a>

    <form class="form-floating" v-on:submit.prevent="sendForm">
      <div
        class="modal fade"
        id="usernameModal"
        tabindex="-1"
        aria-labelledby="usernameModal"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="usernameModal">
                Please enter a new username
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div class="form-floating">

              <input
                id="username"
                v-model="usernameToSet.username"
                type="text"
                username="username"
                class="form-control"
              />
              <label for="username">Username</label>
              </div>
              <p v-if="errorMsg !== ''" style="color: red">{{ errorMsg }}</p>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <!-- <button type="button" class="btn btn-primary">Save changes</button> -->
              <button
                type="submit"
                class="btn btn-primary"
                data-bs-dismiss="modal"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
import http from "../../http-common";

export default defineComponent({
  computed: {
    ...mapGetters("auth", {
      getUserProfile: "getUserProfile",
    }),
  },

  data() {
    return {
      errorMsg: "",
      usernameToSet: {
        username: "",
      },
    };
  },

  methods: {
    async sendForm() {
      await http
        .post("/users/setusername", this.usernameToSet)
        .then((response) => {
          console.log(response);
          this.errorMsg = "";
          window.location.reload();
        })
        .catch((error) => {
          console.log(
            "msg = ",
            error.response.data.error,
            "full error = ",
            error
          ),
            (this.errorMsg = error.response.data.message);
          // this.$router.push("/home");
        });
      // window.location.reload();
    },
  },
});
</script>

<style scoped lang="scss"></style>
