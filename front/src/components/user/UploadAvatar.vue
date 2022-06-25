<template>
  <div class="uploadAvatar">
    <div class="img-container mx-auto">
      <img :src="this.image" class="profile_avatar_private" />
      <div
        class="modify_avatar"
        type="button"
        data-bs-toggle="modal"
        data-bs-target="#twoFaModal"
      >
        <div class="modify_avatar_icon">
          <i style="color: #fff774" class="material-icons">edit</i>
        </div>
      </div>
    </div>
    <!-- <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal"> -->
    <!-- Launch demo modal
    </button> -->
    <div
      class="modal fade"
      id="twoFaModal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Upload Avatar</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <img
              :src="this.image"
              class="profile_avatar_public mx-auto d-block mb-1"
            />
            <p v-if="success === true">Successfully uploaded</p>
            <input
              class="form-control"
              type="file"
              accept="image/*"
              id="file"
              ref="file"
              @change="onFileSelected"
            />
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
            <button type="submit" class="btn btn-primary" @click="onUpload">
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common";
// import store from "../../store"

export default defineComponent({
  data() {
    return {
      // eslint-disable-next-line
      selectedFile: null as any,
      success: false,
      // eslint-disable-next-line
      image: null as any,
    };
  },

  methods: {
    onFileSelected() {
      try {
        // eslint-disable-next-line
        this.selectedFile = (this.$refs.file as any).files[0];
      } catch (e) {
        console.log("error: ", e);
      }
    },

    onUpload() {
      let file = new FormData();
      if (this.selectedFile === null) return;
      file.append("image", this.selectedFile, this.selectedFile.name);

      if (file === null) return;
      http
        .post("/users/uploadavatar", file)
        .then((res) => {
          console.log(res), (this.success = true);
          this.getAvatar();
          this.$emit("updateAvatar");
        })
        .catch((error) => {
          console.log("error on upload = ", error);
        });
    },

    async getAvatar() {
      http
        .get("/users/avatar", { responseType: "blob" })
        .then((response) => {
          const blob = response.data;

          this.image = URL.createObjectURL(blob);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },

  created() {
    this.getAvatar();
  },
});
</script>

<style lang="scss">
img.Image {
  max-width: 100%;
  max-height: 100%;
}
</style>
