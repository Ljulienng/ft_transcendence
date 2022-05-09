import axios from "axios";

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
	// async loginApi({ commit }, payload) {
	//   const response = await axios("http://localhost:3000/auth/42")
	// 	.catch((err) => {
	// 	  console.log(err);
	// 	});
   
	//   if (response && response.data) {
	// 	commit("setLoginApiStatus", "success");
	//   } else {
	// 	commit("setLoginApiStatus", "failed");
	//   }
	// },
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