
<template>
  <div class="app">
    <Sidebar/>

	<router-view />
  </div>
</template>

<script setup>
  /* tslint:disable:no-unused-variable */
import Sidebar from './components/Sidebar.vue'
</script>

<script>
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

:root {
	--primary: #dedc4a;
	--primary-alt: #dedc4a;
	--grey: #64748b;
	--dark: #1e293b;
	--dark-alt: #334155;
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
	background: var(--light);
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