<template>

    <div>

        <button class="input-group-btn" type="button" data-bs-toggle="modal" data-bs-target="#chanListModal">
            <div class="row">
                <i style="color: #fff774" class="col-auto material-icons">forum</i>
                <h4 class="col">join existing channel</h4>
            </div>   
        </button>

        <div class="modal fade" id="chanListModal" tabindex="-1" aria-labelledby="chanListModal" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">

                    <div class="modal-header">

                        <h5 class="modal-title" id="chanListModal">Existing channels</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    
                    </div>
                    
                    <div class="modal-body text-dark">

                        <div class="row my-2" v-for="channel in channelList" :key="channel">
                            <div class="col-10 mx-auto">
                                <ChannelListElem 
                                    :id="channel.id"
                                    :type="channel.type"
                                    :name="channel.name"
                                    :owner="channel.owner.username"
                                />
                            </div>
                            
                            <div class="col-auto">
                                <button @click="joinChannel(channel.id, channel.type)">
                                    <i style="color: #fff774" class="material-icons">add</i>
                                </button>
                            </div>
                            
                            <input
                                v-if="channel.type == 'protected'"
                                type="password"
                                maxlength="20"
                                v-model="password"
                                placeholder="password"
                            />

                        </div>
                    </div>

                </div>
            </div>
        </div>

    </div>

</template>

<script lang="ts">

    import { defineComponent } from "@vue/runtime-core";
    import ChannelListElem from "./ChannelListElem.vue";

    export default defineComponent({

        props: ['channelList'],

        components: {
            ChannelListElem,
        },

        data() {
            return {
                password: "",
            };
        },

        methods: {

            joinChannel(channelId: number, channelType: string) {
                this.$emit('join', channelId, channelType, this.password);
                this.password = "";
            },

        },
        
    })

</script>