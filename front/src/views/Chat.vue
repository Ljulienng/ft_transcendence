<template>
    
    <div class="container-fluid py-5" style="padding-left: 100px; padding-right: 20px;">
        <div class="container-fluid row justify-content-around h-100 w-100">
            
            <!-- LEFT -->
            <div class="container-fluid col-5 h-100">
                <div class="d-flex align-items-center" style="height: 5rem">
                    <h3>chat</h3>
                    <CreateChannel/>
                </div>
                
                <div class="container-fluid widebox" style="height: 70rem">
                    <ChatTests @conv="getConv"
                                @type="getType" 
                                @privacy="getPrivacy"
                    />
                </div>
            </div>

            <!-- RIGHT -->
            <div class="col-7 colorbox h-100" v-if="convToShow === 0">
                Select a conversation
            </div>
            <div class="col-7 colorbox h-100" style="height: 75rem; padding: 0%;" v-if="convToShow > 0">
                <PrivateChatBox v-if="type==='priv'"
                    :receiverId="convToShow"
                    :key="componentKey"
                    :is="true"
                ></PrivateChatBox>

                <ChannelBox v-if="type==='chan'"
                    :channel="convToShow"
                    :channelType="privacy"
                    :socketChannel="socket"
                    :key="componentKey"
                    :is="true"
                    @close="updateComponent"
                    @update="updateComponent_"
                ></ChannelBox>
            </div>
            
        </div>
        
    </div>
</template>

<script lang="ts">

    import { defineComponent } from "@vue/runtime-core";
    import CreateChannel from "../components/chat/CreateChannel.vue";
    import ChatTests from "../components/chat/ChatTests.vue";
    import PrivateChatBox from "../components/chat/PrivateChatBox.vue";
    import ChannelBox from "../components/chat/ChannelBox.vue";
    import store from "../store";

    export default defineComponent({

        components: {
            CreateChannel,
            ChatTests,
            PrivateChatBox,
            ChannelBox,
        },

        data() {
            return {
                convToShow: 0,
                componentKey: 0,
                type: "priv",
                privacy: "public",
                socket: store.getters["auth/getUserSocket"],
            };
        },

        methods: {

            getConv(value: number) {
                this.convToShow = value;
                this.componentKey += 1;
                console.log("conv= ", value);
            },

            updateComponent() {
                this.convToShow = 0;
                this.componentKey += 1;
                console.log("emit updateChannel in Chat.vue for close event")
                this.socket.emit("updateChannel");
            },

            updateComponent_() {
                console.log("emit updateChannel in Chat.vue")
                this.socket.emit("updateChannel");
            },

            getType(value: string) {
                this.type = value;
                console.log("type= ", value);
            },

            getPrivacy(value: string) {
                this.privacy = value;
                console.log("privacy= ", value);
            },
        },

    });

</script>