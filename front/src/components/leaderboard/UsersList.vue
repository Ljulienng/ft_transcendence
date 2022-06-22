<template>
    <div id="users_list" class="pl-6" style="padding-right: 20px">
        
        <div class="d-flex align-items-center mt-4">
          <h3>{{ title }}</h3>
        </div>

        <div class="container-fluid widebox" style="height: 100%; max-height: 55rem;">
          <table class="table table-borderless" id="users">
            <thead>
              <tr>
                <th scope="col" v-for="column in columns" :key="column" class='text-center'>
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
/* eslint-disable */
  import { defineComponent } from "@vue/runtime-core";
  import http from "../../http-common"
  import Stats from "./Stats.vue";


  export default defineComponent({

      components: {
          Stats,
      },

      data () {
          return {
            ranking: 1,
            users: [],
            title: 'leaderboard',
            columns: ['ranking', 'player', 'games played', 'victories', 'defeats', 'points'],
          }
      },

      methods: {
          async getUsers() {
              try {
                  const response  = await http.get('/users/leaderboard');

                  this.users = response.data;
                  this.users.forEach((user: any) => {user.ranking = this.ranking++})
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
