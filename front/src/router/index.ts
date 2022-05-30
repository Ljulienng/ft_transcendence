import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import HelloWorld from '@/components/HelloWorld.vue'
import ShowUsers from '@/components/ShowUsers.vue'
import AuthModal from '@/components/AuthModal.vue'
import TwoFaAuth from '@/components/TwoFaAuth.vue'
import FriendList from '@/views/FriendList.vue'
import UserProfile from '@/views/UserProfile.vue'
import Home from '@/views/Home.vue'
import Test from '@/views/Test.vue'
// import http from '../http-common'
import Chat from '@/views/Chat.vue'


const routes = [
	// {
	// 	name: 'Base',
	// 	path: '/',
	// 	meta: {requiredAuth: true}
	// },
	{
		name: 'Root',
		path: '/',
		component: Home,
		meta: {requiredAuth: true}
	},
	{
		name: 'Test',
		path: '/test',
		component: Test,
	},
	{
		name: 'Home',
		path: '/home',
		component: Home,
		meta: {requiredAuth: true}
	},
	{
		name: 'Hello',
		path: '/hello',
		component: HelloWorld
	},
	{
		name: 'ShowUsers',
		path: '/showusers',
		component: ShowUsers
	},
	{
		name: 'AuthModal',
		path: '/authmodal',
		component: AuthModal,
		beforeEnter: async () => {
			let userProfile = store.getters["auth/getUserProfile"];

			if (userProfile.id === 0) {
				await store.dispatch("auth/userProfile");
				userProfile = store.getters["auth/getUserProfile"];
				console.log("userprofile beforecreate = ", userProfile.id);
			}
		
			console.log("userprofile beforeEnter = ", userProfile.id)
			if (userProfile.id !== 0) router.push("http://localhost:3001/");
			return true
		}
	},
	{
		name: 'TwoFA',
		path: '/twofaauth',
		component: TwoFaAuth
	},
	{
		name: 'FriendList',
		path: '/friendlist',
		component: FriendList,
		meta: {requiredAuth: true}
	},
	{
		name: 'chat',
		path: '/chat',
		component: Chat,
		meta: {requiredAuth: true}
	},
	{
		name: 'UserProfile',
		path: '/userprofile',
		component: UserProfile,
		meta: {requiredAuth: true}
	}
];

const router = createRouter({
	history: createWebHistory(),
	routes,
})

router.beforeEach(async (to, from, next) => {
	if (to.meta.requiredAuth) {
	let userProfile = store.getters["auth/getUserProfile"];
		if (userProfile.id === 0) {
			await store.dispatch("auth/userProfile");
			userProfile = store.getters["auth/getUserProfile"];
			if (userProfile.id === 0) {
				return next({ path: "/authmodal" });
			} 
			else {
				if (userProfile.twoFAEnabled === true) {
					let TwoFAauth = store.getters["auth/getTwoFAauth"];

					if (TwoFAauth === false || undefined) {
						await store.dispatch('auth/setTwoFAauth')
						TwoFAauth = store.getters["auth/getTwoFAauth"];

						if (TwoFAauth === true)
							return next();
						else
							return next({ path: "/twofaauth" });
					}
					else
						return next();
				}
				else {
					return next();
				}
			}
		}
	}
	return next();
});

export default router;