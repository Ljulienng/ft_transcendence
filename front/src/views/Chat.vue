<template>
    <!-- <v-row> -->
    <div class="container-fluid py-5" style="padding-left: 100px; padding-right: 20px;">
        <div class="container-fluid row justify-content-around h-100 w-100">
            <div class="container-fluid col-5 h-100">
                <div class="d-flex align-items-center" style="height: 5%">
                    <h3>chat</h3>
                    <CreateChannel/>
                </div>
                
                <div class="container-fluid widebox" style="height: 95%">
                    <ChatTests @conv="getConv"/>
                </div>
            </div>
            <div class="col-7 colorbox h-100">
                <PrivateChatBox
                    v-bind:receiverId="this.convToShow"
                    :is="true"
                ></PrivateChatBox>
            </div>
            
        </div>
        <!-- </v-row> -->
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
                convToShow: 0
            };
        },

        methods: {
            getConv(value: number) {
                this.convToShow = value
                console.log("conv= ", value);
            }
        },

    })

</script>