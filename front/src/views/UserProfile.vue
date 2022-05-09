<template>
	<div class="userProfile">
		<UploadAvatar/>
		<button @click="logout">Logout</button>
	</div>
</template>

<script lang='ts'>
import { defineComponent } from "@vue/runtime-core";
import http from '../http-common'
import store from '../store'

export default defineComponent({
	// setup() {


		
	// },

	methods: {

		setStatus() {

			http.post('/users/setstatus', {newStatus: 'Offline'})
			.then(res => {
				console.log(res);
			})
			.catch(err => {
				console.log(err);
			})
		},

		logout() {
			const userSocket = store.getters['auth/getUserSocket'].id
  
			if (!userSocket)
				store.dispatch('auth/setUserSocket')
			store.dispatch('auth/setUserStatus', 'Offline');
			http.delete('/logout')
			.then(res => {
				console.log(res);
				window.location.reload()
			})
			.catch(err => {
				console.log(err);
			})
		}
	}
})
</script>
