<template>
	<div class="centered">
		<h4 class="mt-3">points to victory</h4>
		<div>
			<button class="left_arrow" @click="decrementWinScore"></button>
			<p class="point2win" @click="incrementWinScore">{{ winScores.at(winScoreIndex) }}</p>
			<button class="right_arrow" @click="incrementWinScore"></button>
		</div>
		<br />
		<h4>theme</h4>
		<div>
			<button class="left_arrow" @click="decrementTheme"></button>
			<p class="theme" @click="incrementTheme">{{ themes.at(themeIndex).name }}</p>
			<button class="right_arrow" @click="incrementTheme"></button>
		</div>
		<br />
		<button class="mybtn mb-4" @click="play" v-if="$route.name == 'FriendList' || $route.name == 'chat'"
			data-bs-dismiss="modal" aria-label="Close">{{ button }}</button>
		<button class="mybtn mb-4" @click="play" v-if="$route.name != 'FriendList' && $route.name != 'chat'">{{ button
		}}</button>
	</div>
</template>

<script lang="ts">
// import "../../assets/css/style.css";
import { defineComponent } from "@vue/runtime-core";
import store from "../../store";
import GameOptionI from "@/types/interfaces/gameoption.interface";
/* eslint-disable */

export interface UserProfile {
	id: number;
	userName: string;
	email: string;
	status: string;
}

export default defineComponent({
	name: "Options",
	data() {
		return {
			socket: store.getters['auth/getUserSocket'],
			winScores: [3, 5, 10, 1],
			winScoreIndex: 0,
			themes: [
				{ name: 'dark', bgColor: '#1c1d21', fgColor: 'lightgrey' },
				{ name: 'light', bgColor: 'lightgrey', fgColor: '#1c1d21' },
				{ name: 'ocean', bgColor: '#006d77', fgColor: '#ffc300' },
				{ name: 'earth', bgColor: '#6a994e', fgColor: '#f2e8cf' },
				{ name: 'ground', bgColor: '#895737', fgColor: '#f3e9dc' }

			],
			themeIndex: 0,
			button: this.$route.name == 'FriendList' || this.$route.name == 'chat' ? 'invite' : 'play'
		};
	},

	methods: {
		incrementTheme() {
			if (this.themeIndex < this.themes.length - 1) {
				this.themeIndex += 1;
			} else {
				this.themeIndex = 0;
			}
		},
		decrementTheme() {
			if (this.themeIndex > 0) {
				this.themeIndex -= 1;
			} else {
				this.themeIndex = this.themes.length - 1;
			}
		},
		incrementWinScore() {
			if (this.winScoreIndex < this.winScores.length - 1) {
				this.winScoreIndex += 1;
			} else {
				this.winScoreIndex = 0;
			}
		},
		decrementWinScore() {
			if (this.winScoreIndex > 0) {
				this.winScoreIndex -= 1;
			} else {
				this.winScoreIndex = this.winScores.length - 1;
			}
		},
		async play() {
			if (this.$route.name == 'FriendList' || this.$route.name == 'chat') {
				const options = { theme: this.themes[this.themeIndex], winScore: this.winScores[this.winScoreIndex] };
				this.$emit('invitation', options);
			} else {
				const options: GameOptionI = {
					theme: this.themes[this.themeIndex],
					winScore: this.winScores[this.winScoreIndex]
				};
				this.socket.volatile.emit('playerRegister', options);
				this.$router.push('/play');
			}
		}
	},
	beforeMount() {
		// if player is in game, redirect it to its game
		this.socket.volatile.emit('amIInGame', (amIInGame: boolean) => {
			if (amIInGame == true) {
				this.socket.volatile.emit('playerReconnect');
				this.$router.push('/play');
			}
		});
		setTimeout(() => {
			this.socket.volatile.emit('amIInGame', (amIInGame: boolean) => {
				if (amIInGame == true) {
					this.socket.volatile.emit('playerReconnect');
					this.$router.push('/play');
				}
			});
		}, 100);
	}
});
</script>

<style src="../../assets/css/home.css" scoped>
</style>
