import axios from "axios";
import { Commit } from "vuex"
import { ActionContext } from "vuex";


export interface State {
	loginApiStatus: string,
	socket: unknown,
	userProfile: {
		id: number,
		userName: string,
		email: string,
		status: string,
	}
}

const state = () => ({
	loginApiStatus: "",
	userProfile:{
		id:0,
		userName:"",
		email:"",
		status:"Offline"
	}
});

const getters = {
	getLoginApiStatus(state: State) {
		return state.loginApiStatus;
	},
	getUserProfile(state: State){
		return state.userProfile;
	}
};

const actions = {
	setUserSocket({commit}: {commit: Commit}) {
		commit("setUserSocket")
	},

	setUserStatus({commit}: {commit: Commit}, userStatus: string) {
		
	},

	// eslint-disable-next-line
	async userProfile({commit}: any){
		const response = await axios
		.get("http://localhost:3000/userinfo", {withCredentials: true})
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
			state.socket = io('http://localhost:3000', {withCredential: true});
	},

	connectUser(state: State) {
		state.userProfile.status = "Online";
	},

	disconnectUser(state: State) {
		state.userProfile.status = "Offline";
	},

	setLoginApiStatus(state: State, data: any) {
		state.loginApiStatus = data;
	},
	// eslint-disable-next-line
	setUserProfile(state: State, data: any){
		const userProfile = {
			id:data.id,
			userName: data.username,
			email: data.email,
			status: data.status
		};
		state.userProfile = userProfile
	}
};

export default {
namespaced: true,
state,
getters,
actions,
mutations,
};