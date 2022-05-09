<template>
	<div id="friend">

		<form v-on:submit.prevent="addFriend">
			<p>
				<label for="id">friend username </label>
				<input
				id="id"
				v-model="friendToAdd.friendUsername"
				type="string"
				name="id"
				>
			</p>
			<p v-if="errorMsg !== ''" style="color: red">
				{{errorMsg}}
			</p>
			<p>
				<input
				type="submit"
				value="ADD"
				>
			</p>
		</form>

		<div class="friendList">
			<ul>
				<li v-for="friend in friendList" :key="friend" >
					{{friend.username}} ({{friend.firstname}}, {{friend.lastname}}) is {{getFriendStatus(friend.username)}} {{this.userStatus}}
					<button v-on:click="deleteFriend(friend.username)"> DELETE </button>
				</li>
			</ul>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core"
import http from "../http-common"

export default defineComponent({
	data() {
		return {
			userStatus: "",
			errorMsg: "",
			friendList: [],
			friendToAdd: {
				friendUsername: ""
			}
		}
	},

	methods: {
		async getFriendList() {
			try{
				const response = await http.get('/users/friendlist');
				this.friendList = response.data;
			} catch (e) {
				console.log(e);
			}
		},

		getFriendStatus(friendUsername: string) {
			http.get('/users/status/' + friendUsername)
			.then(res => {
				console.log(res.data);
				this.userStatus = res.data
			})
			.catch(err => {
				console.log(err);
			})

		},

		async addFriend() {
			await http.post('/users/addfriend', this.friendToAdd)
			.then(
				response => { console.log("success", response); this.getFriendList(); this.errorMsg = "" }
			)
			.catch(
				error => { console.log("msg = ", error.response.data.error, "full error = ", error), this.errorMsg = error.response.data.error }
			)
		},

		async deleteFriend(friendUsername: string) {
			console.log("friend to delete =" ,friendUsername)
			await http.delete('/users/deletefriend', {data:{username: friendUsername}})
			.then(
				response => { console.log("success", response); this.getFriendList(); this.errorMsg = "" }
			)
			.catch(
				error => { this.errorMsg = error.response.data.error }
			)
		}
	},

	created () {
		this.getFriendList();
	},

	watch: {
		updateFriendList() {
			this.getFriendList()
		}
	}
})
</script>

<style lang="scss">
	body {
		color: white;
	}

	#friend {
		width: 100%;
		height: 100%;
		padding-left: 100px;
	}

	.friendList {
		// height: 100%;
		// width: 80%;
		height: 10rem;
		border: 10px, black;
	}

	li {
		padding: 10px
	}
</style>