<template>
    <div id='chat'>

        <div class="createChat">
            <h3>Create new channel</h3>
            Name <input type="text" maxlength="20" v-model="name" class="inputName" />
            <div>
                <div class="one_elem">
                    <input type="radio" value="public" v-model="privacy"/>
                    <label for="public">Public</label>
                </div>
                <div>
                    <input type="radio" value="protected" v-model="privacy" />
                    <label for="protected">Protected</label>
                </div>
                <div>
                    <input type="radio" value="private" v-model="privacy" />
                    <label for="private">Private</label>
                </div>        
            </div>
            <div  v-if="privacy == 'protected'">
                <input  class="input_password" type="password"  v-model="password" required>
                <p>*Minimun 8 characters</p>
            </div> 
            <button @click="createChat">create channel</button>
        </div><br>

        <div> 
            <button @click="deleteChat">delete channel with id </button>
            <input type="number" v-model="channelId" class="inputChannelId" />
        </div><br>

        <div> 
            <button @click="sendMessage">Send message</button>
            <input type="text" maxlength="100" v-model="message.content" class="inputMessage" />
            in channel <input type="text" maxlength="100" v-model="message.roomId" class="inputChannelId" />  
        </div>

        <div class="channelList">
            <h3>Channel list</h3>
            <ul>
                <li v-for="channel in channelList" :key="channel">
                    [{{channel.id}}]  channel -> {{channel.name}} created by {{channel.owner.username}}
                        <div v-for="message in messageList" :key="message">
                            <!-- channel.id = {{channel.id}}   message.roomId = {{message.roomId}} -->
                            <div v-if="channel.id == message.roomId">
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
            socket: io(),
            channelList: [],
            message: {
                content: '',
                roomId: 0,
            },
            messageList: [] as MessageI[],
            name: '',
            password: '',
            privacy: '',
            user: '',
            
            channelId: 0,
        }
    },
    computed: {
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
            //this.socket.emit('addChannel', channel);
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
            console.log('sendMessage - on roomId : ', this.message.roomId);
            this.socket.emit('sendMessage', this.message.content, this.message.roomId);
            // this.message.content = '';
        },
    },
    created() {
        this.socket = io('localhost:3000/chat', {  withCredentials: true });
        this.getChannelList();
    },

    mounted() {
        // this.socket.on('messageSent', (data) => {
        //     this.message = data;
        //     this.messageList.push(data);
        //     console.log('Message sent to the front : ', data);
        // });
    },
})
</script>

<style scoped>
    div {
        color: white;
    }
    button {
        color: white;
        border: thin solid #CCCCCC
    }
</style>