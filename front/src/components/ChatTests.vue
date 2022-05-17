<template>
    <div id='chat'>

        <div class="form">
			<form>
				<h5>Create new channel</h5><br>
				<input type="text" class="field" maxlength="20" v-model="name" placeholder="Channel name..." required/>
				<br>
				<toggle-switch class="toggle_switch" :options= "myOptions" @change="privacy=$event.value"/>
				<div  v-if="privacy == 'protected'">
					<input type="password" class="field" :disabled=false v-model="password" placeholder="Password..." required><br>
					<span v-if="err.password" class="error">{{err.password}}</span>
					<br>
				</div>
				<div  v-else>
					<input type="text" class="field" :disabled=true v-model="password" placeholder="Password..."><br>
					<br>
				</div>
				<br><br>
				<!-- <button class="mybtn" @click="createChat">create channel</button> -->
				<input type="submit" class="mybtn" value="create channel" @click="createChat">
			</form>
        </div>
		<br>

        <div> 
            <button @click="deleteChat">delete channel with id </button>
            <input type="number" v-model="channelId"/>
        </div>
		<br>

        <div> 
            <button @click="sendMessage">Send message</button>
            <input type="text" maxlength="100" v-model="message.content" class="inputMessage" />
            in channel <input type="text" maxlength="100" v-model="message.channelId"/>  
        </div>
		<br>

        <div class="channelList">
            <h3>Channel list</h3>
            <ul>
                <li v-for="channel in channelList" :key="channel">
                    {{channel.id}} - "{{channel.name}}" : created by {{channel.owner.username}}
                        <div v-for="message in messageList" :key="message">
                            <!-- channel.id = {{channel.id}}   message.channelId = {{message.channelId}} -->
                            <div v-if="channel.id == message.channelId">
                                message : {{message.content}}
                            </div>
                        </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core"
import axios from 'axios'
import io from 'socket.io-client'
import http from "../http-common"
import MessageI from '../types/interfaces/message.interface'

export default defineComponent({
    
    data() {
        return {
            socket: io('http://localhost:3000/chat', {  withCredentials: true }),
            channelList: [],
            message: {
                content: '',
                channelId: 0,
            },
            messageList: [] as MessageI[],
            name: '',
            password: '',
            privacy: '',
            user: '',
			err: [],
            
            channelId: 0,
            myOptions: {
                layout: {
                    color: 'black',
                    backgroundColor: '#c4c4c4',
                    selectedColor: 'black',
                    selectedBackgroundColor: '#fff774',
                    fontFamily: 'Inter',
                    fontWeight: 'normal',
                    fontWeightSelected: 'bold',
                    squareCorners: false,
                    noBorder: true
                },
                size: {
                    fontSize: 1,
                    height: 2,
                    padding: 0.5,
                    width: 30,
                },
                items: {
                    delay: .4,
                    preSelected: 'private',
                    disabled: false,
                    labels: [
                        {name: 'public'}, 
                        {name: 'private'},
                        {name: 'protected'}
                    ]
                }
}
        }
    },

	watch: {
		password(value){
			this.password = value;
			this.validatePassword(value);
		}
	},

    methods: {
        async getChannelList() {
            try {
                const response = await axios.get('http://localhost:3000/channel');
                this.channelList = response.data;
                console.log('get channelList : ', response.data);
            } catch (error) {
                console.log(error);
            }
        },

        async getMessageList() {
            try {
                const response = await axios.get('http://localhost:3000/channel/' + this.channelId + '/messages');
                this.messageList = response.data;
                console.log('get messageList of channel ', this.channelId, ' : ', response.data);
            } catch (error) {
                console.log(error);
            }
        },

        createChat() {
            console.log("chat created : name=", this.name, " privacy=", this.privacy, " password=", this.password);
            let channel = {
                name: this.name,
                privacy: this.privacy,
                password: this.password,
             }
            http.post('/channel', channel, { withCredentials: true });
            this.getChannelList();
            this.name = '';
            this.privacy = '';
            this.password = '';
        },

        deleteChat() {
            console.log("delete channel");
            http.delete('/channel/' + this.channelId);
            this.getChannelList(); 
            this.channelId = 0;
        },

        sendMessage() {
            console.log('sendMessage - on channelId ', this.message.channelId, this.message.content);
            // this.socket.emit('sendMessage', this.message.content, this.message.channelId);
            this.socket.emit('sendMessage', this.message);
            // this.message.content = '';
        },

		validatePassword(value: string) {
			let difference = 8 - value.length;
			if (difference > 0) {
				this.err['password'] = 'Must be at least 8 characters';
			} else {
				this.err['password'] = '';
			}
		},
    },
    created() {
        this.socket = io('localhost:3000/chat', {  withCredentials: true });
        this.getChannelList();
    },

})
</script>

<style src="../assets/css/home.css" scoped>
    div {
        color: rgb(0, 0, 0);
    }
    ul {
		padding-left: 10%;
    }
    button {
        color: white;
        border: thin solid #ffffff
    }
</style>