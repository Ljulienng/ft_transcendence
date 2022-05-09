<template>
	<div class="userProfile">
		<UploadAvatar/>
		<button @click="logout">Logout</button>
	</div>
</template>

<script lang='ts'>
import { defineComponent } from "@vue/runtime-core";
// import { useCookies } from "vue3-cookies"
import http from '../http-common'
// import router from '../router'

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
			this.setStatus();
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
