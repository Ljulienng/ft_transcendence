<template>
    <div>
        <div class="avatar">
         <img :src="this.image" class="Image" />
        </div>
        <p style="color: white">
        {{userInfo.username}} | {{userInfo.total}} | 
        {{userInfo.gameWon}} | {{userInfo.gameLost}} |
        {{userInfo.ranking}} | {{userInfo.points}}
        </p>
        <h2>Match History</h2>
        <ul>
            <li v-for="match in userInfo.matchHistory" :key="match">
                <p v-if="userInfo.username  === match.winner" style="color: green">
                {{ match.playerOne.username }} | {{ match.playerTwo.username }} |
                {{ match.playerOneScore }}:{{ match.playerTwoScore }}
                </p>
                <p v-else style="color: red">
                {{ currentUser.username }}
                {{ match.playerOne.username }} | {{ match.playerTwo.username }} |
                {{ match.playerOneScore }}:{{ match.playerTwoScore }}
                </p>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../http-common"

export default defineComponent({
    data() {
        return {
            userInfo: {
				username: "",
				total: 0,
				gameWon: 0,
				gameLost: 0,
				ranking: 0,
				points: 0,
				matchHistory: []
			},
            // eslint-disable-next-line
            image: null as any,
            // userInfo: []
        }
    },

    methods: {
        async getuserInfo() {
            await http.get("/users/public/" + this.$route.params.username)
            .then((response) => {
                this.userInfo = response.data;
            })
            .catch((error) => {
                console.log(error);
            })
        },
        async getAvatar() {
            http
            .get("/users/avatar/" + this.$route.params.username, { responseType: "blob" })
            .then((response) => {
            const blob = response.data;

            this.image = URL.createObjectURL(blob);
            })
            .catch((error) => {
            console.log(error);
            });
        },
    },

    created() {
        this.getuserInfo();
        this.getAvatar();
        console.log("public user profile = ", this.userInfo   )
    } 
})
</script>
