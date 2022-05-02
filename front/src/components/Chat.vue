<template>
    <div id='chat'>

        <div class="createChat">
            <h3>Create new channel</h3>
            Name <input type="text" maxlength="12" v-model="name" class="inputName" />
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
        </div>

        <div class="channelList">
            <h3>Channel list</h3>
            <ul>
                <li v-for="channel in channelList" :key="channel">
                    {{channel.id}} {{channel.name}}
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core"
import axios from 'axios'
import io from 'socket.io-client'

export default defineComponent({
    data() {
        return {
            socket: io(),
            channelList: [],
            name: '',
            password: '',
            privacy: '',
        }
    },
    computed: {
    },
    methods: {
        async getChannelList() {
            try {
                const response = await axios.get('http://localhost:3000/channel');
                this.channelList = response.data;
                console.log(response.data);
            } catch (error) {
                console.log(error);
            }
        },

        createChat() {
            console.log("chat created : name=", this.name, " privacy=", this.privacy, " password=", this.password);
            let channel = {
                name: this.name,
                status: this.privacy,
                password: this.password,
             }
            this.socket.emit('addChannel', channel);
        },
    },
    created () {
        this.socket = io('http://localhost:3000/chat', {  withCredentials: true });
        this.getChannelList();
    },
})
</script>

<style scoped>
    div {
        color: white;
    }
</style>