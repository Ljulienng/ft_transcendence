
<template>
  <div class="app">
    <Sidebar/>

	<router-view />
	<MyModal/>
	<div id="my-modals"/>
  </div>
</template>

<script lamg='ts'>
import { defineComponent } from "@vue/runtime-core";
import http from './http-common'
import store from './store'
import router from './router'

import { mapGetters} from "vuex";

export default defineComponent({
	computed: {
		...mapGetters("auth", {
		getUserProfile: "getUserProfile",
		}),
	},


	methods: {
		async checkUserstatus() {
			let userProfile = store.getters["auth/getUserProfile"];

			if (userProfile.id === 0) {
				await store.dispatch("auth/userProfile");
				userProfile = store.getters["auth/getUserProfile"];
			}

			if (userProfile.id === 0)
				router.push('http://localhost:3001/authmodal')
			const userId = store.getters['auth/getUserProfile'].id

			// console.log('userId = ', userId);
			// const userSocket = store.getters['auth/getUserSocket'].id
	
			// if (!userSocket)
			// 	store.dispatch('auth/setUserSocket')
			if (userId)
				await store.dispatch('auth/setUserStatus', 'Online');
		},
		
		setOffline() {
			const userSocket = store.getters['auth/getUserSocket'].id
	
			if (!userSocket)
				store.dispatch('auth/setUserSocket')
			store.dispatch('auth/setUserStatus', 'Offline');
			http.post('/users/setstatus', {newStatus: 'Offline'})
			.then(res => {
				console.log(res);
			})
			.catch(err => {
				console.log(err);
			})
		}
	},

	created(){
		window.addEventListener('beforeunload', this.setOffline) 
		this.checkUserstatus();
	},
})
</script>

<script>
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

:root {
	--primary: #fff774;
	--primary-alt: #fff774;
	--grey: #c4c4c4;
	--dark: #2e2e2e;
	--dark-alt: #595959;
	--light: #f1f5f9;
	--sidebar-width: 250px;
}

* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
	font-family: 'Fira sans', sans-serif;
}
body {
	background-image: url('~@/assets/background.jpg');
	background-repeat: no-repeat;
	background-size: cover;
}
button {
	cursor: pointer;
	appearance: none;
	border: none;
	outline: none;
	background: none;
}

.app {
	display: flex;
	main {
		flex: 1 1 0;
		padding: 2rem;
		@media (max-width: 1024px) {
			padding-left: 6rem;
		}
  }
}
</style>