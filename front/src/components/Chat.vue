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

        <!-- <div> 
            Message <input type="text" maxlength="100" v-model="message" class="inputMessage" />
            <button @click="sendMessage">send test message</button>
        </div> -->

        <div class="channelList">
            <h3>Channel list</h3>
            <ul>
                <li v-for="channel in channelList" :key="channel">
                    [{{channel.id}}]  channel -> {{channel.name}}
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

export default defineComponent({
    data() {
        return {
            socket: io(),
            channelList: [],
            name: '',
            password: '',
            privacy: '',
            user: '',
            message: '',
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

        createChat() {
            console.log("chat created : name=", this.name, " privacy=", this.privacy, " password=", this.password);
            let channel = {
                name: this.name,
                privacy: this.privacy,
                password: this.password,
             }
            //this.socket.emit('addChannel', channel);
            http.post('/channel', channel);
            this.getChannelList();
            this.name = '';
            this.privacy = '';
            this.password = '';
        },

        deleteChat() {
            console.log("delete channel");
            http.delete('/channel/' + this.channelId);
            this.channelId = 0;
        },

        sendMessage() {
            // this.socket.emit('sendMessage', this.message);
            this.message = '';
        },
    },
    created() {
        this.socket = io('localhost:3000/chat', {  withCredentials: true });
        this.getChannelList();
    },

    mounted() {
        this.getChannelList();
    }

    // mounted() {
    //     this.socket.on('messageSent', (data) => {
    //         console.log('Message sent to the front : ', data);
    //     });
    // },
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