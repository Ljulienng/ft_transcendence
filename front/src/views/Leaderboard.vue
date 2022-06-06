<template>

    <div id="leaderboard" class="container-fluid px-6 mx-5">
        <div class="container-fluid">
            <UsersList/>
        </div>
    </div>

</template>

<script lang='ts'>

    import { defineComponent } from "@vue/runtime-core";
    import UsersList from "../components/leaderboard/UsersList.vue";
    
    export default defineComponent({
        
        components: {
            UsersList,
        },
        
    })

</script>

<style scoped>
ul {
	padding-left: 250px;
}
</style>