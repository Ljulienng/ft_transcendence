<template>
<!-- universal modal -->
<div>
  <MyModal
    v-model="isShow"
    :close="closeModal"
    :options="options"
  >
    <div class="modal">
      <p>Enter authentification code</p>

      <form v-on:submit.prevent="authenticateTwoFA">
        <p>
          <label for="twoFA"></label>
          <input
            id="TwoFA"
            v-model="twoFA.twoFactorAuthenticationCode"
            type="text"
            username="TwoFA"
          >
        </p>
        <p>
          <input
            type="submit"
            value="Submit"
          >
        </p>
      </form>
      <button @click="closeModal">
        close
      </button>
    </div>
  </MyModal>
</div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { mapGetters } from "vuex";
import http from "../http-common"

export default defineComponent({

  computed: {
    ...mapGetters("auth", {
      getUserProfile: "getUserProfile",
    }),
  },

  data() {
    return {
        twoFA: {
          twoFactorAuthenticationCode: '',
        }
      };
    },

  methods: {
    async authenticateTwoFA() {
        console.log('twoFactorAuthenticationCode = ', this.twoFA)
        await http.post("/twofa/authenticate", this.twoFA)
        .then(
        response => {
            console.log(response)
            this.$router.push("http://localhost:3001/home")

        })
        .catch(
        error => { console.log("msg = ", error.response.data.error, "full error = ", error), error.response.data.error}
        )
    },
  },

  setup () {
    const isShow = ref(true)

    const options = {
      closeClickDimmed: false,
      closeKeyCode: false,
    }

    function showModal () {
      isShow.value = true
    }


    function closeModal () {
      isShow.value = false
    }

    return {
      isShow,
      options,  
      showModal,
      closeModal
    }
  },

})

</script>

<style scoped lang="scss">
.modal {
  width: 300px;
  padding: 30px;
  box-sizing: border-box;
  // background-color: #fff;
  font-size: 20px;
  text-align: center;
}
</style>