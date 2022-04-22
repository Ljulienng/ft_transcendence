import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '@/components/HelloWorld.vue'
import ShowUsers from '@/components/ShowUsers.vue'
import Pong from '@/components/Pong.vue'
import AuthModal from '@/components/AuthModal.vue'
import Home from '@/views/Home.vue'

const routes = [
	{
		name: 'Home',
		path: '/home',
		component: Home,
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
		name: 'Play',
		path: '/play',
		component: Pong
	},
	{
		name: 'AuthModal',
		path: '/authmodal',
		component: AuthModal
	}
];

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router;
