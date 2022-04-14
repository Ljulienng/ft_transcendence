<template>

<div class="app">
	<ul>
		<li v-for="user in users" :key="user.username" >
			{{user.id}}: {{user.username}}, {{user.email}}
		</li>
	</ul>
  <br/>
  <form v-on:submit.prevent="checkForm">
  <p>
    <label for="username">Username</label>
    <input
      id="username"
      v-model="createUser.username"
      type="text"
      username="username"
    >
  </p>
  <p>
    <label for="email">Email</label>
    <input
      id="email"
      v-model="createUser.email"
      type="text"
      name="email"
    >
  </p>
  <p>
    <input
      type="submit"
      value="Submit"
    >
  </p>
  </form>
  <form v-on:submit.prevent="deleteForm">
   <p>
    <label for="id">ID to delete</label>
    <input
      id="id"
      v-model="idToDelete.id"
      type="number"
      name="id"
    >
  </p>
  <p>
    <input
      type="submit"
      value="Submit"
    >
  </p>
  </form>
</div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      users: [],
      createUser: {
        username: '',
        email: ''
      },
      idToDelete: {
        id: ''
      }

    };
  },
  methods: {

    async getData() {
      try {
        const response  = await axios.get('users');

        this.users = response.data;
      } catch (error) {
        console.log(error);
      }
    },
    checkForm() {
      axios.post("users", this.createUser)
    },
    deleteForm() {
      axios.post("users/delete", this.idToDelete);
    }
  },
  mounted() {
    this.getData();
  },
  updated: function () {
    this.getData();
  },
  
}
</script>

<style scoped>
ul {
	padding-left: 250px;
}
</style>