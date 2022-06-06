<template>

<div>

    <!-- Button trigger modal -->
    <div class="d-flex align-items-center mt-4">
      <h3>friends</h3>
      <button class="btn" data-bs-toggle="modal" data-bs-target="#addFriendModal">
        <i style="color: #fff774" class="material-icons">person_add_alt_1</i>
      </button>
    </div>

    <!-- Modal -->

    <div
      class="modal fade"
      id="addFriendModal"
      tabindex="-1"
      aria-labelledby="addFriendModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">

        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title" id="addFriendModalLabel">Add friend</h5>
            <button
              id="closeModalButton"
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body">

            <form
              class="needs-validation"
              novalidate
              v-on:submit.prevent="addFriend"
            >
              <div class="row align-items-center justify-content-between">
                
                <div class="col">
                  <div class="position-relative">
                    <input
                      id="id"
                      class="form-control"
                      v-model="friendToAdd.friendUsername"
                      type="text"
                      name="id"
                      placeholder="Username..."
                      required
                    />
                  </div>

                  <div
                    id="idHelp"
                    class="form-text"
                    v-if="errorMsg !== ''"
                    style="color: red"
                  >
                    {{ errorMsg }}
                  </div>

                </div>

                <div class="col-auto">
                  <div class="mb-4 mt-4 text-center">
                    <button type="submit">
                      <i style="color: #fff774" class="material-icons">send</i>
                    </button>
                  </div>
                </div>

              </div>

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

export default defineComponent({

  data() {

    return {
      socket: store.getters["auth/getUserSocket"],
      errorMsg: "",
      friendList: [],
      friendToAdd: {
        friendUsername: "",
      },
    };
  },

  methods: {
      async getFriendList() {
      try {
        const response = await http.get("/users/friendlist");
        this.friendList = response.data;
      } catch (e) {
        console.log(e);
      }
    },

    async addFriend() {
      await http
        .post("/users/addfriend", this.friendToAdd)
        .then((response) => {
          console.log("/users/addfriend success", response);
          this.getFriendList();
          this.errorMsg = "";
          (document.getElementById("closeModalButton") as any).click();
          this.$forceUpdate();
        })
        .catch((error) => {
          console.log(
            " /users/addfriend msg = ",
            error.response.data.error,
            "full error = ",
            error
          ),
            (this.errorMsg = error.response.data.error);
        });
    },
  },

  mounted() {
     
  },

  created() {
    
  },

});
</script>

<style lang="scss">
</style>
