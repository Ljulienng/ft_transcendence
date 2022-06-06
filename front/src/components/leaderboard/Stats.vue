<template>
    <tr>
        <th scope="row">{{ user.username }}</th>
        <td>{{ userStats.total }}</td>
        <td>{{ userStats.gameWon }}</td>
        <td>{{ userStats.gameLost }}</td>
        <td>{{ userStats.ranking }}</td>
        <td>{{ userStats.points }}</td>
    </tr>
</template>

<script lang="ts">

    import { defineComponent } from "@vue/runtime-core";
    import http from "../../http-common"

    export default defineComponent({

        props: ['user'], 

        data () {
            return {
                x: this.user,
                stats: [],
                userStats: {
                    total: 0,
                    gameWon: 0,
                    gameLost: 0,
                    ranking: 0,
                    points: 0,
                },
            }
        },

        methods: {
            async getStats() {
                try {
                    // const response  = await http.get('/stats');
                    const response  = await http.get('/users/stats');
                    this.stats = response.data;
                    // const x: any = this.stats.find(d => d["user_id"] === this.user.id)
                    const user_stats: any = this.stats.find(d => d["id"] === this.user.id)
                    console.log("user stats = ", user_stats)
                    this.userStats.gameWon = user_stats.gameWon;
                    this.userStats.gameLost = user_stats.gameLost;
                    this.userStats.ranking = user_stats.ranking;
                    this.userStats.points = user_stats.points;
                    this.userStats.total =
                        this.userStats.gameWon + this.userStats.gameLost;
                } catch (error) {
                    console.log(error);
                }
            },
        },
        
        created () {
            this.getStats();
        },

    })
</script>

<style lang="scss">
</style>
