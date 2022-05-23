<template>
	<div class="channelBox">
		<p>{{channel}}</p>
		<div class="messageList">
			<p v-for="msg in messageList" :key="msg">
				{{ msg.user.username }}: {{ msg.content }}
			</p>
		</div>
		<div>
            <button @click="sendMessage">Send message</button>
            <input
				type="text"
				maxlength="100"
				v-model="message.content"
				class="inputMessage"
			/>
        </div>
		<br>
	</div>
</template>

<script lang="ts">
import MessageI from "../types/interfaces/message.interface"
import io, { Socket } from "socket.io-client"
// import http from '../http-common'
import { defineComponent, getCurrentScope } from "@vue/runtime-core";
import store from "../store"

export default defineComponent({
	props: {
		channel: {
			type: Number,
		},
		socketChannel: {
			type: Socket,
		}
	},

	data() {
		return {
			// test: io('http://localhost:3000/channel', {  withCredentials: true}),
			currentUser: store.getters["auth/getUserProfile"],
			message: {
				userId: 0,
				username: '',
                content: '',
                channelId: this.channel,
            },
			socket: store.getters["auth/getUserProfile"],
            messageList: [] as MessageI[],
            messageList2: [] as MessageI[]

		}
	},

	methods: {
		sendMessage() {
			this.message.userId = this.currentUser.id;
			this.message.username = this.currentUser.username;
            console.log(
				"sendMessage - on channelId ",
				this.message.channelId,
				this.message.content
			);
			this.socket.emit('sendMessageToServer', this.message);
            // this.socket.emit('sendMessageToServer', this.message);
			// this.getMessageList();

        },

		async getMessages() {
			this.socket.emit("getChannelMsg", this.channel);
			await this.socket.on("getChannelMessages", (data: MessageI[]) => {
				this.messageList = data;
			})
		}

	},

	mounted() {
		if (this.socket === undefined) {
			this.socket = store.getters("auth/getUserSocket")
		}
		this.socket.on("messageSent", (data: unknown) => {
			console.log("updated", data);
			this.getMessages();
		})

	},

	// unmounted() {
	// 	this.test.close;
	// },

	created() {
        console.log("socket = ", this.socket)

		console.log("Channelbox created");
		this.getMessages()
	}
	// setup() {
	// },
})
</script>

<style lang="scss">
	.channelBox {
		float: right;
	}
</style>