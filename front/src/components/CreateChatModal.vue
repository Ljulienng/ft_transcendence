<template>
    <div>
    <b-button v-b-modal.modal-1>Launch demo modal</b-button>

    <b-modal id="modal-1" title="BootstrapVue">
        <p class="my-4">Hello from modal!</p>
    </b-modal>
    </div>
</template>

<script>
import { defineComponent } from "@vue/runtime-core"

export default defineComponent({
    // setup() {
        
    // },
})
</script>

<style scoped>

</style>
