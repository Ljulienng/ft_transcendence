<template>
	<div class="userProfile">
		<button class='logout' @click="logout">Logout</button>
		<UploadAvatar/>
		<TwoFactorModal/>
	</div>
</template>

<script lang='ts'>
import { defineComponent } from "@vue/runtime-core";
import http from '../http-common'
import TwoFactorModal from '../components/TwoFactorModal.vue'
import store from '../store'

export default defineComponent({
	components: {
		TwoFactorModal
	},

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

<style lang='scss'>

.userProfile {
	width: 100%;
}

.logout
{
    float: right;
    border: none;
    background: #EDEDED;
    font-size: 24px;
    color: arial;
    padding: 5px 10px;
}
.logout:hover
{
    background: red;
    cursor: pointer;
}

</style>