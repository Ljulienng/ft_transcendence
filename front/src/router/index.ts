import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import HelloWorld from '@/components/HelloWorld.vue'
import ShowUsers from '@/components/ShowUsers.vue'
import AuthModal from '@/components/AuthModal.vue'
import FriendList from '@/views/FriendList.vue'
import Home from '@/views/Home.vue'


const routes = [
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
		name: 'FriendList',
		path: '/friendlist',
		component: FriendList,
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
			} else {
				return next();
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