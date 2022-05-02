<template>

<div class="app">
	<ul>
		<li v-for="user in users" :key="user.username" >
			{{user.id}}: {{user.username}}, {{user.email}}
		</li>
	</ul>
  <br/>
  <form v-on:submit.prevent="sendForm">
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
      value="ADD"
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
      value="Delete"
    >
  </p>
  </form>
</div>
</template>

<script lang='ts'>
// import axios from 'axios'

import { defineComponent } from "@vue/runtime-core";
import http from "../http-common"

export default defineComponent({
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
        const response  = await http.get('/users');

        this.users = response.data;
        console.log("user list = ", this.users)
      } catch (error) {
        console.log(error);
      }
    },
    sendForm() {
      http.post("/users", this.createUser)
      this.getData();
    },
    deleteForm() {
      console.log("to delete = ", this.idToDelete);
      http.delete("/users/delete", {data: this.idToDelete});
      this.getData();
    }
  },
  
  created () {
      this.getData();
  },

  // watch: {
	// 	updateUserList() {
	// 		this.getData()
	// 	}
	// }
  
})
</script>

<style scoped>
ul {
	padding-left: 250px;
}
</style>