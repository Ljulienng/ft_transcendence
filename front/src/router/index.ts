import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import Pong from '@/components/Pong.vue'
import AuthModal from '@/components/auth/AuthModal.vue'
import TwoFaAuth from '@/components/auth/TwoFaAuth.vue'
import FriendList from '@/views/FriendList.vue'
import UserProfile from '@/views/UserProfile.vue'
import Home from '@/views/Home.vue'
import NotFound from '@/views/NotFound.vue'
// import http from '../http-common'
import Chat from '@/views/Chat.vue'
import Leaderboard from '@/views/Leaderboard.vue'
import PublicUserProfile from '@/views/PublicUserProfile.vue'

const routes = [

  {
		path: "/:catchAll(.*)",
		name: "NotFound",
		component: NotFound,
	},
	{
		name: 'Root',
		path: '/',
		component: Home,
		meta: {requiredAuth: true}
	},
	{
		name: 'Home',
		path: '/home',
		alias: ['/'],
		component: Home,
		meta: {requiredAuth: true}
	},
	{
		name: 'Play',
		path: '/play',
		component: Pong
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
	},
	{
		name: 'PublicProfile',
		path: '/public/:username',
		component: PublicUserProfile,
		meta: {requiredAuth: true}
	},
	{
		name: 'Leaderboard',
		path: '/leaderboard',
		component: Leaderboard,
		meta: {requiredAuth: true}
	},
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
		store.dispatch("auth/setUserStatus", "Online");

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
