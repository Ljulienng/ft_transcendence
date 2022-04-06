<template>

<div class="app">
	<ul>
		<li v-for="user in users" :key="user.username" >
			{{user.username}}
		</li>
	</ul>
</div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      users: [],
    };
  },
  methods: {
    async getData() {
      try {
        const response  = await axios.get('http://localhost:3000/users');

        this.users = response.data;
      } catch (error) {
        console.log(error);
      }
    },
  },
  created() {
    this.getData();
  },
}
</script>

<style scoped>
ul {
	padding-left: 250px;
}
</style>