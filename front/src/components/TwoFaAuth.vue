<template>
<!-- universal modal -->
<div>
  <MyModal
    v-model="isShow"
    :close="closeModal"
    :options="options"
  >
    <div class="twofa-modal">
      <p>Enter authentification code</p>
      <p v-if="errorMsg !== ''" style="color: red; font-size: 12px">
				{{errorMsg}}
			</p>
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
        errorMsg: '',
        twoFA: {
          twoFactorAuthenticationCode: '',
        }
      };
    },

  methods: {
    async authenticateTwoFA() {
        console.log('twoFactorAuthenticationCode = ', this.twoFA)
        await http.post("/twofa/authenticate", this.twoFA, {withCredentials: true})
        .then(
        response => {
            console.log("went in then", response)
            this.$store.dispatch('auth/setTwoFAauth')
            this.$router.push("http://localhost:3001/home") 
        })
        .catch(
          error => { console.log("full error = ", error.response.data.message); this.errorMsg = error.response.data.message}
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
  
  created() {
    console.log('isShow = ', this.isShow);
  }
})

</script>

<style scoped lang="scss">
.twofa-modal {
  width: 300px;
  padding: 30px;
  box-sizing: border-box;
  // background-color: #fff;
  font-size: 20px;
  text-align: center;
}
</style>