<template>
	<aside :class="`${is_expanded ? 'is-expanded' : ''}`">
		<div class="logo">
			<img :src="logoURL" alt="Vue" /> 
		</div>

		<div class="menu-toggle-wrap">
			<button class="menu-toggle" @click="ToggleMenu">
				<span class="material-icons">keyboard_double_arrow_right</span>
			</button>
		</div>

		<h3>Menu</h3>
		<div class="menu">
			<router-link to="/home" class="button">
				<span class="material-icons">home</span>
				<span class="text">Home</span>
			</router-link>
			<router-link to="/friendlist" class="button">
				<span class="material-icons">group</span>
				<span class="text">Show users</span>
			</router-link>
			<router-link to="/chat" class="button">
				<span class="material-icons">chat</span>
				<span class="text">Chat</span>
			</router-link>
			<!-- <router-link to="/userprofile" class="button">
				<span class="material-icons">account_circle</span>
				<span class="text">User Profile</span>
			</router-link> -->
			<router-link to="/play" class="button">
				<span class="material-icons">videogame_asset</span>
				<span class="text">Play</span>
			</router-link>
			<router-link to="/leaderboard" class="button">
				<span class="material-icons">emoji_events</span>
				<span class="text">Leaderboard</span>
			</router-link>
			<template v-if="getUserProfile.id !== 0">
				<router-link to="/userprofile" class="button">
					<span >
						<img :src="this.avatar" class="sidebar_profile_avatar"/>
					</span>
					<span class="text" style='margin-left: 1rem'>Profile</span>
				</router-link>
			</template>
		</div>

		<div class="flex"></div>
		
		<div class="menu" v-if="getUserProfile.id !== 0">
			<button class="button" @click='logout'>
				<span class="material-icons">power_settings_new</span>
				<span class="text">Chat</span>
			</button>
		</div>

	</aside>
</template>

<script lang='ts'>
import { defineComponent } from "@vue/runtime-core";
import { mapGetters } from "vuex";
import http from '../http-common'
import store from '../store'

export default defineComponent({
  computed: {
    ...mapGetters("auth", {
      getUserProfile: "getUserProfile",
    }),
  },

  data() {
	return {
		socket: store.getters["auth/getUserSocket"],
		// eslint-disable-next-line
		avatar: null as any
	}
  },
  
  methods: {
    logout() {
      const userSocket = store.getters["auth/getUserSocket"].id;

      if (!userSocket) store.dispatch("auth/setUserSocket");
      store.dispatch("auth/setUserStatus", "Offline");
      http
        .delete("/logout")
        .then((res) => {
          console.log(res);
		//   this.$router.push('/authmodal');
          window.location.reload();
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },

  mounted() {
	  this.socket.on('updateAvatar', () => {
		store.dispatch('auth/setUserAvatar').then(() => {
			this.avatar = store.getters['auth/getUserAvatar']
		})
	  })
  },

  async created() {
	if (this.getUserProfile.id !== 0)
	{
		if (!store.getters['auth/getUserAvatar']) {
			await store.dispatch('auth/setUserAvatar')
			// console.log('test', store.getters['auth/getUserAvatar'])
			this.avatar = store.getters['auth/getUserAvatar'] 
		}

	}
  }
})
</script>

<script setup lang="ts">
import { ref } from 'vue'
  /* tslint:disable:no-unused-variable */
import logoURL from '../assets/42_Logo.svg.png'
const is_expanded = ref(localStorage.getItem("is_expanded") === "true")
const ToggleMenu = () => {
	is_expanded.value = !is_expanded.value
	localStorage.setItem("is_expanded", is_expanded.value)
}
</script>




<style lang="scss">
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");
aside {
	display: flex;
	flex-direction: column;
	background-color: var(--dark);
	color: var(--light);
	width: calc(2rem + 32px);
	overflow: hidden;
	min-height: 100vh;
	padding: 1rem;
	transition: 0.2s ease-in-out;
	.flex {
		flex: 1 1 0%;
	}
	.logo {
		margin-bottom: 1rem;
		align-self: center;
		img {
			width: 3rem;
		}
	}
	.menu-toggle-wrap {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
		position: relative;
		top: 0;
		transition: 0.2s ease-in-out;
		.menu-toggle {
			transition: 0.2s ease-in-out;
			.material-icons {
				font-size: 2rem;
				color: var(--light);
				transition: 0.2s ease-out;
			}
			
			&:hover {
				.material-icons {
					color: var(--primary);
					transform: translateX(0.5rem);
				}
			}
		}
	}
	h3, .button .text {
		opacity: 0;
		transition: opacity 0.3s ease-in-out;
	}
	h3 {
		color: var(--grey);
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
	}
	.menu {
		margin: 0 -1rem;
		.button {
			display: flex;
			align-items: center;
			text-decoration: none;
			transition: 0.2s ease-in-out;
			padding: 0.5rem 1rem;
			.material-icons {
				font-size: 2rem;
				color: var(--light);
				transition: 0.2s ease-in-out;
			}
			.text {
				color: var(--light);
				transition: 0.2s ease-in-out;
			}
			&:hover {
				background-color: var(--dark-alt);
				.material-icons, .text {
					color: var(--primary);
				}
			}
			&.router-link-exact-active {
				background-color: var(--dark-alt);
				border-right: 5px solid var(--primary);
				.material-icons, .text {
					color: var(--primary);
				}
			}
		}
	}
	.footer {
		opacity: 0;
		transition: opacity 0.3s ease-in-out;
		p {
			font-size: 0.875rem;
			color: var(--grey);
		}
	}
	&.is-expanded {
		width: var(--sidebar-width);
		.menu-toggle-wrap {
			top: 0rem;
			
			.menu-toggle {
				transform: rotate(-180deg);
			}
		}
		h3, .button .text {
			opacity: 1;
		}
		.button {
			.material-icons {
				margin-right: 1rem;
			}
		}
		.footer {
			opacity: 0;
		}
	}
	@media (max-width: 1024px) {
		// position: absolute;
		z-index: 99;
	}
}
</style>
