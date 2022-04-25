<template>
<!-- universal modal -->
<div>
  <p>
    <button @click="showModal">
      Show modal
    </button>
  </p>
  <MyModal
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
import { ref } from 'vue'
// import axios from 'axios'

export default {
  inject:['http'],
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
        this.http.post("/users/setusername", this.usernameToSet)
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
}

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