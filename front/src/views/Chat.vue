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
                    <ChatTests @conv="getConv"/>
                </div>
            </div>

            <!-- RIGHT -->
            <div class="col-7 colorbox h-100" v-if="convToShow === 0">
                Select a conversation
            </div>
            <div class="col-7 colorbox" style="height: 75rem;" v-if="convToShow > 0">
                <PrivateChatBox
                    v-bind:receiverId="convToShow"
                    :key="componentKey"
                    :is="true"
                ></PrivateChatBox>
            </div>
            
        </div>
        
    </div>
</template>

<script lang="ts">

    import { defineComponent } from "@vue/runtime-core"
    import CreateChannel from "../components/chat/CreateChannel.vue"
    import ChatTests from "../components/chat/ChatTests.vue"
    import PrivateChatBox from "../components/chat/PrivateChatBox.vue";

    export default defineComponent({

        components: {
            CreateChannel,
            ChatTests,
            PrivateChatBox,
        },

        data() {
            return {
                convToShow: 0,
                componentKey: 0,
            };
        },

        methods: {
            getConv(value: number) {
                this.convToShow = value
                this.componentKey += 1;
                console.log("conv= ", value);
            }
        },

    })

</script>