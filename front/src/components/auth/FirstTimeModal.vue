<template>
  <div class="firstTimeModal">
    <form v-on:submit.prevent="updateUser">
      <div
        class="modal fade"
        id="exampleModalToggle"
        ref="exampleModalToggle"
        aria-hidden="true"
        aria-labelledby="exampleModalToggleLabel"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalToggleLabel">
                Welcome {{ currentUser.userName }}!
              </h5>
              <!-- <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> -->
            </div>
            <div class="modal-body">
              Your default informations are the one from 42. You can still
              change them right here or whenever you want from your profile !
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn"
                data-bs-target="#exampleModalToggle2"
                data-bs-toggle="modal"
                data-bs-dismiss="modal"
              >
                <i
                  style="color: #fff774; font-size: 36px"
                  class="material-icons"
                  >double_arrow</i
                >
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        class="modal fade"
        id="exampleModalToggle2"
        aria-hidden="true"
        aria-labelledby="exampleModalToggleLabel2"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalToggleLabel2">
                Username change ?
              </h5>
            </div>
            <div class="modal-body">
              <label for="username">Username</label>
              <br />
              <input
                id="username"
                v-model="userInfo.username"
                type="text"
                :placeholder="currentUser.userName"
                username="username"
              />
              <br />
              <small class="text-muted"
                >Leave the field empty if you don't want to change it</small
              >
            </div>
            <div class="modal-footer">
              <!-- <button  type="button" class="btn float-left" data-bs-target="#exampleModalToggle3" data-bs-toggle="modal" data-bs-dismiss="modal"><i style="color: #fff774; font-size:36px" class="material-icons">double_arrow_left</i></button> -->
              <button
                type="button"
                class="btn"
                data-bs-target="#exampleModalToggle3"
                data-bs-toggle="modal"
                data-bs-dismiss="modal"
              >
                <i
                  style="color: #fff774; font-size: 36px"
                  class="material-icons"
                  >double_arrow</i
                >
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        class="modal fade"
        id="exampleModalToggle3"
        aria-hidden="true"
        aria-labelledby="exampleModalToggleLabel3"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalToggleLabel3">
                More info
              </h5>
            </div>
            <div class="modal-body">
              <label for="firstName">First name</label>
              <br />
              <input
                id="firstName"
                v-model="userInfo.firstName"
                type="text"
                firstName="firstName"
                :placeholder="currentUser.firstName"
              />
              <br />
              <label for="lastName">Last name</label>
              <br />
              <input
                id="lastName"
                v-model="userInfo.lastName"
                type="text"
                :placeholder="currentUser.lastName"
                lastName="lastName"
              />
              <br />
              <label for="email">Email</label>
              <br />
              <input
                id="email"
                v-model="userInfo.email"
                type="text"
                :placeholder="currentUser.email"
                email="email"
              />
              <br />
              <small class="text-muted">Same here</small>
            </div>
            <div class="modal-footer">
              <input
                class="btn btn-primary"
                value="submit"
                type="submit"
                data-bs-dismiss="modal"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
    <!-- <a class="btn btn-primary" data-bs-toggle="modal" href="#exampleModalToggle" role="button" data-bs-dismiss="modal">Open first modal</a> -->
  </div>
</template>
<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";
import { Modal } from "bootstrap";
import store from "../../store";
/* eslint-disable */

export default defineComponent({
  props: ["currentUser"],

  data() {
    return {
      userInfo: {
        username: "",
        firstName: "",
        LastName: "",
        email: "",
      },
      modal: null as any,
    };
  },

  methods: {
    // defineModal() {
    //   this.modal = new Modal(this.$refs.exampleModalToggle as any);
    // },

    updateUser() {
      http.post("/users/firsttime", this.userInfo);
      store.dispatch("auth/userProfile");
      this.$emit("test");
    },
  },

  mounted() {
    this.modal = new Modal(this.$refs.exampleModalToggle as any);
    this.modal.show();
  },
});
</script>
