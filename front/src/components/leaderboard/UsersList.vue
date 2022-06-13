<template>
    <div id="users_list" class="pl-6" style="padding-right: 20px">
        
        <div class="d-flex align-items-center mt-4">
          <h3>{{ title }}</h3>
        </div>

        <div class="container-fluid widebox">
          <table class="table table-borderless" id="users">
            <thead>
              <tr>
                <th scope="col" v-for="column in columns" :key="column">
                  {{ column }}
                </th>
              </tr>
            </thead>
            <tbody v-for="user in users" :key="user">
              <Stats :user="user"/>
            </tbody>
          </table>
        </div>
        
    </div>
</template>

<script lang="ts">

  import { defineComponent } from "@vue/runtime-core";
  import http from "../../http-common"
  import Stats from "./Stats.vue";


  export default defineComponent({

      components: {
          Stats,
      },

      data () {
          return {
            users: [],
            title: 'leaderboard',
            columns: ['username', 'games played', 'victories', 'defeats', 'ranking', 'points'],
          }
      },

      methods: {
          async getUsers() {
              try {
                  const response  = await http.get('/users');

                  this.users = response.data;
                  console.log("user list = ", this.users)
              } catch (error) {
                  console.log(error);
              }
          },
      },
      
      created () {
          this.getUsers();
      },

  })
</script>

<style lang="scss">
</style>
