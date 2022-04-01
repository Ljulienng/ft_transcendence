
<template>
  <div>
    <div v-for="user in users" v-bind:key="user.id">
      <h2>{{ user.id }}</h2>
      <p>{{ user.name }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      users: []
    };
  },
  // async setype() {
  //   this.users = await fetch('http://localhost:3000/users').then(res => res.json()
  //   );
  // }
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
