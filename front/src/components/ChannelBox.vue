<template>
	<div class="channelBox">
		<p>{{channel}}</p>
		<div class="messageList">
			<p v-for="msg in messageList" :key="msg">
				{{ msg.content }}
			</p>
		</div>
		<div>
            <button @click="sendMessage">Send message</button>
            <input type="text" maxlength="100" v-model="message.content" class="inputMessage" />
        </div><br>

	</div>
	
</template>

<script lang="ts">
import MessageI from '../types/interfaces/message.interface'
import io, { Socket } from 'socket.io-client'
import http from '../http-common'
import { defineComponent, getCurrentScope } from "@vue/runtime-core";
import store from '../store'

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
			socket: this.socketChannel,
            messageList: [] as MessageI[],
		}
	},

	methods: {
		// async getMessageList() {
        //     try {
        //         const response = await http.get('http://localhost:3000/channel/' + this.channel + '/messages');
        //         this.messageList = response.data;
        //         console.log('get messageList of channel ', this.channel, ' : ', response.data);
        //     } catch (error) {
        //         console.log(error);
        //     }
        // },

		sendMessage() {
			this.message.userId = this.currentUser.id;
			this.message.username = this.currentUser.username;
            console.log('sendMessage - on channelId ', this.message.channelId, this.message.content);
			this.socket.emit('sendMessageToServer', this.message);
            // this.socket.emit('sendMessageToServer', this.message);
			// this.getMessageList();

        },

	},

	// mounted() {

	// },

	// unmounted() {
	// 	this.test.close;
	// },

	created() {
		console.log("Channelbox created");


	}
	// setup() {
	// },
})
</script>

<style lang='scss'>
	.channelBox {
		float: right;
	}
</style>