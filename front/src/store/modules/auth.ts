import http from '../../http-common'
import { Commit } from "vuex"
import { io, Socket } from 'socket.io-client'


export interface State {
	loginApiStatus: string,
	socket: Socket,
	userProfile: {
		id: number,
		userName: string,
		email: string,
		status: string,
		twoFAEnabled: boolean
	}
}

const state = () => ({
	loginApiStatus: "",
	userProfile:{
		id:0,
		userName:"",
		email:"",
		status:"Offline",
		twoFAEnabled: false
	}
});

const getters = {
	getLoginApiStatus(state: State) {
		return state.loginApiStatus;
	},
	getUserProfile(state: State) {
		return state.userProfile;
	},
	getUserSocket(state: State) {
		return state.socket;
	},
};

const actions = {
	setUserSocket({commit}: {commit: Commit}) {
		commit("setUserSocket")
	},

	async setUserStatus({commit}: {commit: Commit}, userStatus: string) {
		console.log('set user status info = ', userStatus)

		if (userStatus === 'Online') {
			commit('connectUser');
		}
		else if (userStatus === 'Offline')
			commit('disconnectUser');
		else {
			console.log('status unknown');
			return ;
		}

	},

	// eslint-disable-next-line
	async userProfile({commit}: any){
		const response = await http.get("userinfo", {withCredentials: true})
		.catch((err) => {
			console.log(err);
		});

		if(response && response.data){
			console.log(response.data)
			commit("setUserProfile", response.data)
		}
	}
};

const mutations = {
	// eslint-disable-next-line
	setUserSocket(state: State) {
		if (!state.socket)
			state.socket = io('http://localhost:3000/user', {  withCredentials: true });
		console.log('socket = ', state.socket);
	},

	connectUser(state: State) {
		console.log('connect user with socket n ', state.socket)
		state.userProfile.status = "Online"
		state.socket.emit('connectUser', state.userProfile.userName,)
	},

	disconnectUser(state: State) {
		console.log('disconnect user with socket')

		state.userProfile.status = "Offline";
		
		state.socket.emit('disconnectUser', state.userProfile.userName)
	},

	// eslint-disable-next-line
	setLoginApiStatus(state: State, data: any) {
		state.loginApiStatus = data;
	},
	// eslint-disable-next-line
	setUserProfile(state: State, data: any){
		const userProfile = {
			id:data.id,
			userName: data.username,
			email: data.email,
			status: data.status,
			twoFAEnabled: data.twoFAEnabled
		};
		state.userProfile = userProfile
		if (!state.socket)
			state.socket = io('http://localhost:3000/user', {  withCredentials: true });
	}
};

export default {
namespaced: true,
state,
getters,
actions,
mutations,
};