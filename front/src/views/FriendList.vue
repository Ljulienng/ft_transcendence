<template>

	<div id="friend">

		<!-- Button trigger modal -->
		<button type="button" 
				class="btn btn-primary mb-1 mt-4" 
				data-bs-toggle="modal" 
				data-bs-target="#addFriendModal">
			add friend...
		</button>

		<!-- Modal -->
		<div class="modal fade" id="addFriendModal" tabindex="-1" aria-labelledby="addFriendModalLabel" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="addFriendModalLabel">Add friend</h5>
					<button id="closeModalButton" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<div class="row justify-content-center">
						<div class="col-lg-6">
							<form class="needs-validation" novalidate v-on:submit.prevent="addFriend">
								<div class="position-relative">
									<label for="id" class="form-label">friend username </label>
									<input
										id="id"
										class="form-control"
										v-model="friendToAdd.friendUsername"
										type="text"
										name="id"
										placeholder="Username..."
										required
									>
									<div class="valid-tooltip" v-if="errorMsg === ''">
										Looks good!
									</div>
								</div>
								<div class="valid-feedback" v-if="errorMsg === ''">
									Friend added!
								</div>
								<div id="validationServerUsernameFeedback" class="invalid-feedback" v-if="errorMsg !== ''" style="color: red">
									{{errorMsg}}
								</div>

								<div id="idHelp" class="form-text" v-if="errorMsg !== ''" style="color: red">{{errorMsg}}</div>
								
								<div class="mb-4 mt-4 text-center">
									<button
										type="submit"
										class="btn btn-primary"
										value="ADD"
										>Send friend request</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
		</div>

		<div class="container-xl">
			<ul class="list-group mb-4 mt-4">
				<li v-for="friend in friendList" :key="friend" class="list-group-item  d-flex justify-content-between">
					{{friend.username}} ({{friend.firstname}}, {{friend.lastname}}) is {{friend.status}} {{this.userStatus}}
					<button v-on:click="deleteFriend(friend.username)">
						<span class="badge bg-primary rounded-pill">X</span>
					</button>
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
			interval: 0,
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

		async addFriend() {
			await http.post('/users/addfriend', this.friendToAdd)
			.then(
				response => { console.log("/users/addfriend success", response);
					this.getFriendList();
					this.errorMsg = "";
					(document.getElementById("closeModalButton")as any).click();
				}
			)
			.catch(
				error => { console.log(" /users/addfriend msg = ", error.response.data.error, "full error = ", error), this.errorMsg = error.response.data.error }
			)
		},

		async deleteFriend(friendUsername: string) {
			console.log("friend to delete =" ,friendUsername)
			await http.delete('/users/deletefriend', {data:{username: friendUsername}})
			.then(
				response => { console.log("/users/deletefriend success", response); this.getFriendList(); this.errorMsg = "" }
			)
			.catch(
				error => { this.errorMsg = error.response.data.error }
			)
		},

		friendListloop(sec: number) {
			setInterval( () => {this.getFriendList}, sec * 1000);
		}

	},

	created () {
		this.getFriendList();
		// this.friendListloop(5);
	},

	mounted(){
		this.interval = setInterval( async () => {
			const response =  await http.get('/users/friendlist');
			this.friendList = response.data;
		}, 5 * 1000); // 5 sec

	},

	beforeUnmount() {
		clearInterval(this.interval);
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