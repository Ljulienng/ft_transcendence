<template>
  <div class="split">
    <div class="lcol">
      <div class="centered">
          <h4>points to victory</h4>
          <div>
            <button class="left_arrow"></button>
            <p class="point2win">3</p>
            <button class="right_arrow"></button>
          </div>
        <br>
        <h4>theme</h4>
          <div>
            <button class="left_arrow"></button>
            <p class="theme">classic</p>
            <button class="right_arrow"></button>
          </div>
        <br>
        <button class="btn">play</button>
      </div>
    </div>
    <div class="rcol">
      <div class="left-aligned">
        <h1>tran</h1>
        <h1>scen</h1>
        <h1>dence.</h1>
      </div>
    </div>
    <div style="clear:both"></div>
  </div>
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

<style src="../assets/css/home.css" scoped>
</style>
