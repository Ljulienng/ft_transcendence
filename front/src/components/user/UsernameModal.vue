<template>
  <!-- universal modal -->
  <div>
    <br />
    <button class="btn-primary rounded" @click="showModal">
      Change username
    </button>
    <MyModal v-model="isShow" :close="closeModal" :options="options">
      <div class="usernameModal">
        <p class="text-light">Please enter a new username</p>
        <form v-on:submit.prevent="sendForm">
          <p class="text-light">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="usernameToSet.username"
              type="text"
              username="username"
            />
          </p>

          <p>
            <input
              type="submit"
              value="Submit"
              href="http://localhost:3001/home"
            />
          </p>
        </form>
        <p v-if="errorMsg !== ''" style="color: red">{{ errorMsg }}</p>
        <button @click="closeModal" class="btn-danger">close</button>
      </div>
    </MyModal>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
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
    sendForm() {
      http
        .post("/users/setusername", this.usernameToSet)
        .then((response) => {
          console.log(response);
          this.errorMsg = "";
          this.closeModal();
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
    },
  },

  setup() {
    const isShow = ref(false);

    const options = {
      closeClickDimmed: false,
      closeKeyCode: false,
    };

    function showModal() {
      isShow.value = true;
    }

    function closeModal() {
      isShow.value = false;
    }

    return {
      isShow,
      options,
      showModal,
      closeModal,
    };
  },
});
</script>

<style scoped lang="scss">
.modal {
  width: 300px;
  padding: 30px;
  box-sizing: border-box;
  background-color: #fff;
  font-size: 20px;
  text-align: center;
}
</style>
