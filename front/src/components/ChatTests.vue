<template>
    <div id='chat'>

        <div class="createChat">
            <h3>Create new channel</h3>
            Name <input type="text" maxlength="20" v-model="name"/>
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
                <input type="password"  v-model="password" required>
                <p>Minimun 8 characters</p>
            </div> 
            <button @click="createChat">create channel</button>
        </div><br>

        <div> 
            <button @click="deleteChat">delete channel with id </button>
            <input type="number" v-model="channelId"/>
        </div><br>

        <div> 
            <button @click="joinChannel">Join channel with id</button>
            <input type="number" v-model="channelToJoin.id"/>
        </div><br>

        <div> 
            <button @click="sendMessage">Send message</button>
            <input type="text" maxlength="100" v-model="message.content" class="inputMessage" />
            in channel <input type="text" maxlength="100" v-model="message.channelId"/>  
        </div><br>

        <div class="channelList">
            <h3>Channel list</h3>
            <ul>
                <li v-for="channel in channelList" :key="channel">
                    {{channel.id}} - "{{channel.name}}" : created by {{channel.owner.username}}
                    <!-- {{channel.messages}} -->
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core"
import axios from 'axios'
import { io, Socket} from 'socket.io-client'
import http from "../http-common"
import MessageI from '../types/interfaces/message.interface'
import { mapGetters } from "vuex";

export default defineComponent({ 
    
    data() {
        return {
            socket: io(),
            channelList: [],
            message: {
                content: '',
                channelId: 0,
            },
            channelToJoin: {
                id: 0,
                type: '',
                password: '',
                // userId: 0,
            },
            messageList: [] as MessageI[],
            name: '',
            password: '',
            privacy: '',           
            channelId: 0,
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
            http.post('/channel/createChannel', channel, { withCredentials: true });
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
            this.socket.emit('sendMessageToServer', this.message);
        },

        joinChannel() {
            console.log('join channel : ', this.channelToJoin.id);
            this.socket.emit('joinChannel', this.channelToJoin);
        }
    },

    mounted() {
        if (this.socket.connected == false)
            this.socket = io('http://localhost:3000/chat', {  withCredentials: true });
        this.getChannelList();
        
        this.socket.on('sendMessageToClient', (data) => {
            console.log(data);
        })

        this.socket.on('channelJoined', (data) => {
            console.log(data);
        })
    },

    // computed: {
    // ...mapGetters("auth", { getUserProfile: "getUserProfile",})
    // },


})
</script>

<style scoped>
    div {
        color: white;
    }
    ul {
	padding-left: 10%;
    }
    button {
        color: white;
        border: thin solid #CCCCCC
    }
</style>