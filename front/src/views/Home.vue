<template>
	<h1>Welcome, {{msg}}</h1>
</template>

<script>
import {onMounted, ref} from 'vue'
import axios from 'axios'
// import {useStore} from 'vuex'

export default {
	setup() {
		// try {
			const msg = ref('you are not logged in');

			onMounted( async() => {
			const response = await axios.get('/users/userinfo');
			
			console.log(response.data);
			const content = await response.data;
	
			msg.value = content.username;
			// await store.dispatch('setAuth', true);
			})

			return {
				msg
			}
		// } catch(e) {
		// 	await store.dispatch('setAuth', false);
		// }
	}
}
</script>