<template>

    <div>

        <button class="input-group-btn" type="button" data-bs-toggle="modal" data-bs-target="#chanListModal">
          <i style="color: #fff774" class="material-icons">forum</i>
        </button>

        <div class="modal fade" id="chanListModal" tabindex="-1" aria-labelledby="chanListModal" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">

                        <h5 class="modal-title" id="chanListModal">Existing channels</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    
                    </div>
                    
                    <div class="modal-body text-dark">

                        <div class="row my-2" v-for="channel in channelListWithoutPrivate" :key="channel">
                            <div class="col-auto">
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
    import ChannelI from "../../types/interfaces/channel.interface";
    import http from "../../http-common";
    import store from "../../store";

    export default defineComponent({

        components: {
            ChannelListElem,
        },

        data() {
            return {
                socket: store.getters["auth/getUserSocket"],
                channelList: [] as any[],
                channelListWithoutPrivate: [] as any[],
                password: "",
            };
        },

        methods: {

            async getChannelList() {
                try {
                    const response = await http.get("/channel");
                    this.channelList = response.data;
                    this.updateChannelListWithoutPrivate();
                } catch (error) {
                    console.log(error);
                }
            },

            updateChannelListWithoutPrivate() {
                this.channelListWithoutPrivate = [];
                for (var channel of this.channelList) {
                    if (channel.type !== "private") {
                        this.channelListWithoutPrivate.push(channel);
                    }
                }
            },

            joinChannel(channelId: number, channelType: string) {
                console.log('joinChannel child');
                this.$emit('join', channelId, channelType, this.password);
                this.password = "";
            },

        },

        mounted() {
            if (this.socket === undefined) {
                this.socket = store.getters["auth/getUserSocket"];
            }

            this.socket.on("updateChannel", (data: ChannelI[]) => {
                this.channelList = data;
                this.updateChannelListWithoutPrivate();
                this.socket.emit("updateJoinedChannels");
            });
            
        },

        created() {
            this.getChannelList();
        },

        
    })

</script>