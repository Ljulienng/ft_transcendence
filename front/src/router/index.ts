import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import HelloWorld from '@/components/HelloWorld.vue'
import ShowUsers from '@/components/ShowUsers.vue'
import AuthModal from '@/components/AuthModal.vue'
import TwoFaAuth from '@/components/TwoFaAuth.vue'
import FriendList from '@/views/FriendList.vue'
import UserProfile from '@/views/UserProfile.vue'
import Home from '@/views/Home.vue'
// import http from '../http-common'


const routes = [
	// {
	// 	name: 'Base',
	// 	path: '/',
	// 	meta: {requiredAuth: true}
	// },
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
		component: AuthModal
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
					console.log("WENT THEREEEEEE", TwoFAauth)

					if (TwoFAauth === false || undefined) {
						store.dispatch('auth/setTwoFAauth')
						TwoFAauth = store.getters["auth/getTwoFAauth"];
						if (TwoFAauth === true)
							return next();
						else
							return next({ path: "/twofaauth" });
					}
					else
						return next();
					// const data = await http.get('/twofa/check')
					// .then ( res => {
					// 	console.log("res.data = ", res.data)
					// 	return res.data
					// })
					// if (data === true)
					// 	return next();
					// else {
					// 	console.log('res data = ', data)
					// 	return next({ path: "/twofaauth" });
							
					// }
				}
				else {
					return next();
				}
			}
		}
	}
	return next();
});

// router.beforeEach(async (to, from, next) => {
// 	if (to.) {
// 	let userProfile = store.getters["auth/getUserProfile"];
// 		if (userProfile.id === 0) {
// 			await store.dispatch("auth/userProfile");
// 			userProfile = store.getters["auth/getUserProfile"];
// 			if (userProfile.id === 0) {
// 				return next({ path: "/authmodal" });
// 			} else {
// 				return next();
// 			}
// 		}
// 	}
// 	return next();
// });

export default router;