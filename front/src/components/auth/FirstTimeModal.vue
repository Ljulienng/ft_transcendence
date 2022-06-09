<template>
    <div class="firstTimeModal">
    <form v-on:submit.prevent="updateUser">
        <div class="modal fade" id="exampleModalToggle" aria-hidden="true" aria-labelledby="exampleModalToggleLabel" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalToggleLabel">Welcome !</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Your default informations are the one from 42. You can still change them right here or whenever you want from your profile page !
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-target="#exampleModalToggle2" data-bs-toggle="modal" data-bs-dismiss="modal">Open second modal</button>
                </div>
                </div>
            </div>
        </div>
        <div class="modal fade" id="exampleModalToggle2" aria-hidden="true" aria-labelledby="exampleModalToggleLabel2" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalToggleLabel2">Modal 2</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <label for="username">Username</label>
                    <input
                    id="username"
                    v-model="userInfo.username"
                    type="text"
                    username="username"
                    />
                </div>
                <div class="modal-footer">
                    <button  type="button" class="btn btn-primary" data-bs-target="#exampleModalToggle3" data-bs-toggle="modal" data-bs-dismiss="modal">Open second modal</button>
                </div>
                </div>
            </div>
        </div>
        <div class="modal fade" id="exampleModalToggle3" aria-hidden="true" aria-labelledby="exampleModalToggleLabel3" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalToggleLabel3">More info</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <label for="username">First name</label>
                <input
                id="firstName"
                v-model="userInfo.firstName"
                type="text"
                firstName="firstName"
                />
                <br>
                <label for="username">Last name</label>
                <input
                id="lastName"
                v-model="userInfo.lastName"
                type="text"
                lastName="lastName"
                />
                <br>
                <label for="username">Email</label>
                <input
                id="email"
                v-model="userInfo.email"
                type="text"
                email="email"
                />
            </div>
            <div class="modal-footer">
                <input class="btn btn-primary" value="submit" type="submit" data-bs-dismiss="modal"/>
            </div>
            </div>
        </div>
        </div>
    </form>
    <a class="btn btn-primary" data-bs-toggle="modal" href="#exampleModalToggle" role="button" data-bs-dismiss="modal">Open first modal</a>
    </div>
</template>
<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import http from "../../http-common"

export default defineComponent({
    data() {
        return {
            userInfo: {
                username: "",
                firstName: "",
                LastName: "",
                email: ""
            }
        }
    },

    methods: {
        updateUser() {
            http.post("/users/firsttime", this.userInfo)
            console.log('uzu = ', this.userInfo)
        }
    },
})
</script>
