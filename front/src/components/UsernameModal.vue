<template>
<!-- universal modal -->
<div>
  <MyModal
    v-if="getUserProfile.username === ''"
    v-model="isShow"
    :close="closeModal"
    :options="options"
  >
    <div class="modal">
      <p>
        Please enter a
      </p>
      <form v-on:submit.prevent="sendForm">
        <p>
          <label for="username">Username</label>
          <input
            id="username"
            v-model="usernameToSet.username"
            type="text"
            username="username"
          >
        </p>
        <p>
          <input
            type="submit"
            value="Submit"
            href="http://localhost:3001/home"
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
      usernameToSet: {
        username: ''
      }
    };
  },

  methods: {
    sendForm(){
      try {
        http.post("/users/setusername", this.usernameToSet)
        return ('http://localhost:3001')

      } catch(e) {
        return ('http://localhost:3001')
      }
    },
  },

  setup () {
    const isShow = ref(false)

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
  background-color: #fff;
  font-size: 20px;
  text-align: center;
}
</style>