import http from '../../http-common'
import { Commit } from "vuex"
import { io, Socket } from 'socket.io-client'
/* eslint-disable */

export interface State {
	loginApiStatus: string,
	socket: Socket,
	twoFAauth: boolean,
	userProfile: {
		id: number,
		userName: string,
		email: string,
		status: string,
		twoFAEnabled: boolean,
		firstTime: boolean
	}
	avatar: any
}

const state = () => ({
	loginApiStatus: "",
	twoFAauth: false,
	socket: null,
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
	getTwoFAauth(state: State) {
		return state.twoFAauth;
	},

	getUserAvatar(state: State) {
		return state.avatar;
	},
};

const actions = {
	setUserSocket({commit}: {commit: Commit}) {
		commit("setUserSocket")
	},

	async setUserAvatar({commit}: {commit: Commit}) {
		await http
        .get("/users/avatar", { responseType: "blob" })
        .then((response: any) => {
			const blob = response.data;
			
			commit('setUserAvatar', URL.createObjectURL(blob));
        })
        .catch((error:any) => {
          console.log(error.response.data);
        });
	},

	async setUserStatus({commit}: {commit: Commit}, userStatus: string) {
		// console.log('set user status info = ', userStatus)

		if (userStatus === 'Online') {
			await commit('connectUser');
		}
		else if (userStatus === 'Offline')
		await commit('disconnectUser');
		else {
			console.log('status unknown');
			return ;
		}
	},

	async setTwoFAauth({commit}: {commit: Commit}) {
		const data: boolean = await http.get('/twofa/check', {withCredentials: true})
		.then ( (res: any)=> {
			return res.data
		})
		.catch( (err: Error) => {
			console.log("SetTwoFAauth = ", err)
		})

	
		if (data === true)
			commit("setTwoFAauth", data)
		else
			commit("setTwoFAauth", data)
		return data;
	},

	async userProfile({commit}: {commit: Commit}){
		await http.get("userinfo", {withCredentials: true})
		.then((response: any) => {
			if(response && response.data){
				console.log("userinfo =", response.data)
				commit("setUserProfile", response.data)
			}
		})
		.catch(() => {
			console.log("");
		});

	}
};

const mutations = {
	// eslint-disable-next-line
	setUserAvatar(state: State, data: any) {
		// if (!state.avatar)
		state.avatar = data;
	},

	setUserSocket(state: State) {
		if (!state.socket)
			state.socket = io(process.env.VUE_APP_API_ENDPOINT, {  withCredentials: true });
	},
	setTwoFAauth(state: State, data: boolean) {
		state.twoFAauth = data;
	},

	connectUser(state: State) {
		// console.log('connect user with socket :', state.socket)
		state.userProfile.status = "Online"
		state.socket.emit('connectUser', state.userProfile.userName,)
	},

	disconnectUser(state: State) {
		// console.log('disconnect user with socket')
		
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
			twoFAEnabled: data.twoFAEnabled,
			firstTime: data.firstTime
		};
		state.userProfile = userProfile
		if (!state.socket && userProfile.id !== 0 )
			state.socket = io(process.env.VUE_APP_API_ENDPOINT, {  withCredentials: true });

	}
};

export default {
namespaced: true,
state,
getters,
actions,
mutations,
};