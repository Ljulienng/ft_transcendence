<template>

    <div class="createChannel">

        <button class="btn" data-bs-toggle="modal" data-bs-target="#newChatModal">
            <i style="color: #fff774" class="material-icons">add_box</i>
        </button>

        <div
            class="modal fade"
            id="newChatModal"
            tabindex="-1"
            aria-labelledby="newChatLabel"
            aria-hidden="true"
        >
            <div class="modal-dialog">

                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title" id="newChatLabel">Create channel</h5>
                        <button
                            id="closeModalButton"
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div> <!-- modal-header -->

                    <div class="modal-body align-items-center justify-content-between">

                        <form
                            class="needs-validation"
                            v-on:submit.prevent="createChat"
                        >

                            <div>
                                <input 
                                    type="text"
                                    class="form-control"
                                    maxlength="20"
                                    minlength="3"
                                    v-model="name" 
                                    placeholder="Channel Name..." 
                                    required
                                />
                            </div>

                            <br/>

                            <div class="row">
                                <div class="btn-group" role="group" aria-label="Privacy toggle button group">
                                    <input type="radio" class="btn-check" name="type" id="public" autocomplete="off" value="public" v-model="type">
                                    <label class="btn btn-primary" for="public">public</label>

                                    <input type="radio" class="btn-check" name="type" id="protected" autocomplete="off" value="protected" v-model="type">
                                    <label class="btn btn-primary" for="protected">protected</label>

                                    <input type="radio" class="btn-check" name="type" id="private" autocomplete="off" value="private" v-model="type">
                                    <label class="btn btn-primary" for="private">private</label>
                                </div>
                            </div>

                            <br/>
                            
                            <div v-if="type == 'protected'">
                                    <input
                                        type="password"
                                        class="form-control"
                                        minlength="8"
                                        maxlength="20"
                                        v-model="password"
                                        placeholder="Password..."
                                        required
                                    />
                                    <p class="form-text" style="color: grey">Minimun 8 characters</p>
                            </div>

                            <div class="modal-footer">
                                <button type="submit" class="btn btn-primary" data-bs-dismiss="modal" aria-label="Close">create channel</button>
                            </div>
                            
                        </form> <!-- form -->

                    </div> <!-- modal-body -->
                
                </div> <!-- modal-content -->

            </div> <!-- modal-dialog -->

        </div> <!-- newChatModal -->
        
    </div> <!-- createChannel -->
</template>

<script lang="ts">

    import { defineComponent } from "@vue/runtime-core";
    import store from "../../store";

    export default defineComponent({
        data() {
            return {
                socket: store.getters["auth/getUserSocket"],
                errorMsg: "",
                name: "",
                password: "",
                type: "public",
            }
        },

        methods: {
            createChat() {
                let channel = {
                    name: this.name,
                    type: this.type,
                    password: this.password,
                };
                this.socket.emit("createChannel", channel);
                this.name = "";
                this.type = "public";
                this.password = "";
                this.$emit("update");
            },
        },
    });
</script>

<style scoped>
    .mybtn {
        background-color: lightgray;
    }
</style>