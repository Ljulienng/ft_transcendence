<template>
	<h1>Welcome, {{msg}}</h1>
</template>

<script>
import {onMounted, ref} from 'vue'
import axios from 'axios'
import {useStore, store} from 'vuex'

export default {
	setup() {
		const msg = ref('you are not logged in');
		try {
			const store = useStore();

			onMounted( async() => {
			const response = await axios.get('http://localhost:3000/users/userinfo');
			
			console.log(response.data);
			const content = await response.data;
	
			msg.value = content.username;
			await store.dispatch('setAuth', true)
			})

		} catch(e) {
			store.dispatch('setAuth', false);
		}
		return {
			msg
		}
	}
}
</script>