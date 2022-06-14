<template>
    <!-- <v-row> -->
    <div class="container-fluid py-5" style="padding-left: 100px; padding-right: 20px;">
        <div class="container-fluid row justify-content-around h-100 w-100">
            <div class="container-fluid col-4 h-100">
                <h3>chat</h3>
                <CreateChannel/>
                <div class="container-fluid widebox" style="height: 75%">
                    <ChatTests/>
                </div>
            </div>
            <div class="col-7 widebox h-100">
                This will be my conversations
            </div>
        </div>
    </div>
    <!-- </v-row> -->
</template>

<script lang="ts">

    import { defineComponent } from "@vue/runtime-core"
    import CreateChannel from "../components/chat/CreateChannel.vue"
    import ChatTests from "../components/chat/ChatTests.vue"

    export default defineComponent({

        components: {
            CreateChannel,
            ChatTests,
        },

    })

</script>